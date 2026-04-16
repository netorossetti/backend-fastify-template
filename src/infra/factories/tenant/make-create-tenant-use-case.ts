import { CreateTenantUseCase } from "src/domain/application/use-cases/tenant/create-tenant-use-case.js";
import { PrismaMembershipsRepository } from "src/infra/database/repository/prisma-memberships-repository.js";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository.js";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository.js";
import { prisma } from "../../database/prisma.js";
import { BcryptHasher } from "../../lib/criptography/bcrypt-hasher.js";

export function makeCreateTenantUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  const membershipsRepository = new PrismaMembershipsRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new CreateTenantUseCase(
    tenantsRepository,
    usersRepository,
    membershipsRepository,
    bcryptHasher,
  );
}
