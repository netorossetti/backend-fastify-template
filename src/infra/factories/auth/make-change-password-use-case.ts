import { ChangePasswordUseCase } from "src/domain/application/use-cases/auth/change-password-use-case.js";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository.js";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher.js";
import { prisma } from "../../database/prisma.js";

export function makeChangePasswordUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new ChangePasswordUseCase(usersRepository, bcryptHasher);
}
