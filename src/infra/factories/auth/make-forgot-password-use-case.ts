import redisServices from "src/core/lib/redis/redis-services.js";
import { ForgotPasswordUseCase } from "src/domain/application/use-cases/auth/forgot-password-use-case.js";
import { PrismaUsersRepository } from "src/infra/database/repository/prisma-users-repository.js";
import { NodemailerMailSender } from "src/infra/lib/email-sender/nodemailer-mail-sender.js";
import { prisma } from "../../database/prisma.js";

export function makeForgotPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository(prisma);
  const mailSender = new NodemailerMailSender();
  return new ForgotPasswordUseCase(usersRepository, redisServices, mailSender);
}
