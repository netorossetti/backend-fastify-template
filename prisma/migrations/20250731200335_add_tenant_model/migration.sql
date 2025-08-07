/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nick_name` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "enum_document_type" AS ENUM ('RG', 'CNH', 'CPF', 'CNPJ');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "name",
ADD COLUMN "first_name" TEXT NOT NULL,
ADD COLUMN "last_name" TEXT NOT NULL,
ADD COLUMN "nick_name" TEXT NOT NULL,
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "nick_name" TEXT NOT NULL,
    "document_type" "enum_document_type" NOT NULL,
    "document_number" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
