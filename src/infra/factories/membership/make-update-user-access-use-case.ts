import { UpdateUserAccessUseCase } from "src/domain/application/use-cases/membership/update-user-access-use-case";
import { PrismaMembershipsRepository } from "src/infra/database/repository/prisma-memberships-repository";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { prisma } from "../../database/prisma";

export function makeUpdateUserAccessUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  const membershipsRepository = new PrismaMembershipsRepository(prisma);

  return new UpdateUserAccessUseCase(
    usersRepository,
    tenantsRepository,
    membershipsRepository
  );
}
