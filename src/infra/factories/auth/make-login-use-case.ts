import redisServices from "src/core/lib/redis/redis-services";
import { LoginUseCase } from "src/domain/auth/application/use-cases/login-use-case";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { BcryptHasher } from "../../criptography/bcrypt-hasher";
import { prisma } from "../../database/prisma";

export function makeLoginUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new LoginUseCase(usersRepository, bcryptHasher, redisServices);
}
