import redisServices from "src/core/lib/redis/redis-services";
import { ForgotPasswordUseCase } from "src/domain/application/use-cases/auth/forgot-password-use-case";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository";
import { NodemailerMailSender } from "src/infra/lib/email-sender/nodemailer-mail-sender";
import { prisma } from "../../database/prisma";

export function makeForgotPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const mailSender = new NodemailerMailSender();
  return new ForgotPasswordUseCase(usersRepository, redisServices, mailSender);
}
