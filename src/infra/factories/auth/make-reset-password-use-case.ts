import redisServices from "src/core/lib/redis/redis-services.js";
import { ResetPasswordUseCase } from "src/domain/application/use-cases/auth/reset-password-use-case.js";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository.js";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher.js";
import { prisma } from "../../database/prisma.js";

export function makeResetPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new ResetPasswordUseCase(usersRepository, redisServices, bcryptHasher);
}
