import { ChangePasswordUseCase } from "src/domain/application/use-cases/auth/change-password-use-case";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher";
import { prisma } from "../../database/prisma";

export function makeChangePasswordUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new ChangePasswordUseCase(usersRepository, bcryptHasher);
}
