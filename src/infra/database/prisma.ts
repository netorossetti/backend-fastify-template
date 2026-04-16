import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "prisma/generated/prisma/client";

// packages/database/src/client.ts

let prismaInstance: PrismaClient | null = null;

export const getPrisma = () => {
  // Se a URL no env for diferente da URL que o adapter está usando (ou se não houver instância)
  // Nós criamos uma nova. Para simplificar no teste, vamos apenas checar se estamos em modo test.
  if (!prismaInstance || process.env.NODE_ENV === "test") {
    const connectionString = process.env.DATABASE_URL!;
    const url = new URL(connectionString);
    const schema = url.searchParams.get("schema") || "public";

    // 1. Forçamos o search_path no Pool do node-pg
    const pool = new Pool({
      connectionString,
      options: `-c search_path=${schema}`, // Isso garante que queries brutas caiam no schema certo
    });

    // 2. Passamos o schema explicitamente nas configurações do adaptador
    // No Prisma 7, o segundo argumento do PrismaPg é onde definimos o schema
    const adapter = new PrismaPg(pool, { schema });

    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
};

// Mantém a exportação da constante para compatibilidade,
// mas os testes devem preferencialmente usar getPrisma() ou garantir o tempo de import
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const instance = getPrisma();
    // Faz o bind de funções para evitar erros de contexto (this)
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
