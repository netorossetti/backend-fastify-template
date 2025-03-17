import { RegisterUserUseCase } from "src/domain/auth/application/use-cases/register-use-case";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { BcryptHasher } from "../../criptography/bcrypt-hasher";
import { prisma } from "../../database/prisma";

export function makeRegisterUserUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const bcryptHasher = new BcryptHasher();
  return new RegisterUserUseCase(usersRepository, bcryptHasher);
}
