import { ListUserAccessUseCase } from "src/domain/application/use-cases/membership/list-user-access-use-case";
import { PrismaMembershipsRepository } from "src/infra/database/repository/prisma-memberships-repository";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { prisma } from "../../database/prisma";

export function makeListUserAccessUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  const membershipsRepository = new PrismaMembershipsRepository(prisma);

  return new ListUserAccessUseCase(
    usersRepository,
    tenantsRepository,
    membershipsRepository
  );
}
