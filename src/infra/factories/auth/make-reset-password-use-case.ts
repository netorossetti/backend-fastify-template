import redisServices from "src/core/lib/redis/redis-services";
import { ResetPasswordUseCase } from "src/domain/application/use-cases/auth/reset-password-use-case";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher";
import { prisma } from "../../database/prisma";

export function makeResetPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new ResetPasswordUseCase(usersRepository, redisServices, bcryptHasher);
}
