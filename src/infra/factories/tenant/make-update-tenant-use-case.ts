import { UpdateTenantUseCase } from "src/domain/application/use-cases/tenant/update-tenant-use-case";
import { PrismaMembershipsRepository } from "src/infra/database/repository/prisma-memberships-repository";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { prisma } from "../../database/prisma";

export function makeUpdateTenantUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  const membershipsRepository = new PrismaMembershipsRepository(prisma);
  return new UpdateTenantUseCase(
    usersRepository,
    tenantsRepository,
    membershipsRepository
  );
}
