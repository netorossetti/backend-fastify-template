/*
  Warnings:

  - The values [RG] on the enum `enum_document_type` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[document_number]` on the table `tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "enum_document_type_new" AS ENUM ('CNH', 'CPF', 'CNPJ');
ALTER TABLE "tenant" ALTER COLUMN "document_type" TYPE "enum_document_type_new" USING ("document_type"::text::"enum_document_type_new");
ALTER TYPE "enum_document_type" RENAME TO "enum_document_type_old";
ALTER TYPE "enum_document_type_new" RENAME TO "enum_document_type";
DROP TYPE "enum_document_type_old";
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "tenant_document_number_key" ON "tenant"("document_number");
