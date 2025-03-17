import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import 'dotenv/config'

const prisma = new PrismaClient()
const schemaId = randomUUID()

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable.')
  }
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schemaId)

  return url.toString()
}

beforeAll(async () => {
  // Gerar um schema aleatório
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  // Sobrescrever a variavel de ambiente com a nova URL de conexão para os teste
  process.env.DATABASE_URL = databaseURL

  // Executar as migrations do prisma no novo esquema gerado
  execSync('npx prisma migrate deploy')
})

afterAll(async () => {
  // REMOVER BANCO DE DADOS ISOLADO DOS TESTE E2E
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
