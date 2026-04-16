import { FetchTenantsUseCase } from "src/domain/application/use-cases/tenant/fetch-tenants-use-case.js";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository.js";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository.js";
import { prisma } from "../../database/prisma.js";

export function makeFetchTenantsUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  return new FetchTenantsUseCase(usersRepository, tenantsRepository);
}
