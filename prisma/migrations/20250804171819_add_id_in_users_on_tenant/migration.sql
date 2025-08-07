/*
  Warnings:

  - The primary key for the `users_tenants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,tenant_id]` on the table `users_tenants` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `users_tenants` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "users_tenants" DROP CONSTRAINT "users_tenants_pkey",
ADD COLUMN "id" TEXT NOT NULL,
ADD CONSTRAINT "users_tenants_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenants_user_id_tenant_id_key" ON "users_tenants"("user_id", "tenant_id");
