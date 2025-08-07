import { FetchTenantsUseCase } from "src/domain/application/use-cases/tenant/fetch-tenants-use-case";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { prisma } from "../../database/prisma";

export function makeFetchTenantsUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  return new FetchTenantsUseCase(usersRepository, tenantsRepository);
}
