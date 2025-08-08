import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import path from "path";

const prisma = new PrismaClient();
const schemaId = randomUUID();

// Criação de pastas temporárias de upload para testes
const tmpBaseDir = path.join(
  __dirname,
  "..",
  "temp",
  `e2e-uploads-${schemaId}`
);

const tmpPublicPath = path.join(tmpBaseDir, "public");
const tmpPrivatePath = path.join(tmpBaseDir, "private");

// Criar diretórios temporários
mkdirSync(tmpPublicPath, { recursive: true });
mkdirSync(tmpPrivatePath, { recursive: true });

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please provider a DATABASE_URL environment variable.");
  }
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("schema", schemaId);

  return url.toString();
}

// Gerar um schema aleatório
const databaseURL = generateUniqueDatabaseURL(schemaId);

// Ajusta o node_env para teste
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = databaseURL;
process.env.UPLOADS_PUBLIC_PATH = tmpPublicPath;
process.env.UPLOADS_PRIVATE_PATH = tmpPrivatePath;

beforeAll(async () => {
  // Executar as migrations do prisma no novo esquema gerado
  execSync("npx prisma migrate deploy");
});

afterAll(async () => {
  // REMOVER BANCO DE DADOS ISOLADO DOS TESTE E2E
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();

  // Limpa diretórios temporários de uploads
  rmSync(tmpBaseDir, { recursive: true, force: true });
});
