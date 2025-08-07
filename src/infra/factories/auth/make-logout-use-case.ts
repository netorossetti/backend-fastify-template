import redisServices from "src/core/lib/redis/redis-services";
import { LogoutUseCase } from "src/domain/application/use-cases/auth/logout-use-case";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { prisma } from "../../database/prisma";

export function makeLogoutUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  return new LogoutUseCase(usersRepository, redisServices);
}
