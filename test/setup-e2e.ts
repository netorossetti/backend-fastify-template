import "dotenv/config";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import path from "path";

// 1. Prepare as URLs primeiro
const schemaId = randomUUID();
const url = new URL(process.env.DATABASE_URL!);
url.searchParams.set("schema", schemaId);
const databaseURL = url.toString();

// 2. Criação de pastas temporárias de upload para testes
const tmpBaseDir = path.join(__dirname, "..", "temp", `e2e-uploads-${schemaId}`);
const tmpPublicPath = path.join(tmpBaseDir, "public");
const tmpPrivatePath = path.join(tmpBaseDir, "private");
mkdirSync(tmpPublicPath, { recursive: true });
mkdirSync(tmpPrivatePath, { recursive: true });

// 3. Injete no process.env
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = databaseURL;
process.env.UPLOADS_PUBLIC_PATH = tmpPublicPath;
process.env.UPLOADS_PRIVATE_PATH = tmpPrivatePath;

// 4. Importa instancia de banco de dados
import { getPrisma } from "src/infra/database/prisma.js";

beforeAll(async () => {
  // Executar as migrations do prisma no novo esquema gerado
  getPrisma();
  execSync("npx prisma migrate deploy");
});

afterAll(async () => {
  const prisma = getPrisma();
  // REMOVER BANCO DE DADOS ISOLADO DOS TESTE E2E
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();

  // Limpa diretórios temporários de uploads
  rmSync(tmpBaseDir, { recursive: true, force: true });
});
