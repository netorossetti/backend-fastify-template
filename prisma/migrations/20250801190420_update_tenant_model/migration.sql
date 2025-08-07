/*
  Warnings:

  - You are about to drop the column `first_name` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `tenant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_tenant_id_fkey";

-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "role",
DROP COLUMN "tenant_id";

-- CreateTable
CREATE TABLE "users_tenants" (
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "owner" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "permissions" JSONB,
    "last_access_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_tenants_pkey" PRIMARY KEY ("user_id","tenant_id")
);

-- AddForeignKey
ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
