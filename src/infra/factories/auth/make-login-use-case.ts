import redisServices from "src/core/lib/redis/redis-services";
import { LoginUseCase } from "src/domain/application/use-cases/auth/login-use-case";
import { PrismaMembershipsRepository } from "src/infra/database/repository/prisma-memberships-repository";
import { PrismaTenantsRepository } from "src/infra/database/repository/prisma-tenants-repository";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { prisma } from "../../database/prisma";
import { BcryptHasher } from "../../lib/criptography/bcrypt-hasher";

export function makeLoginUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const tenantsRepository = new PrismaTenantsRepository(prisma);
  const membershipsRepository = new PrismaMembershipsRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new LoginUseCase(
    usersRepository,
    tenantsRepository,
    membershipsRepository,
    bcryptHasher,
    redisServices
  );
}
