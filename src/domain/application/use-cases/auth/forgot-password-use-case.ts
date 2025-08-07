import { env } from "src/core/env";
import { NotFoundError } from "src/core/errors/not-found-error";
import { StringHelper } from "src/core/helpers/string-helper";
import { TokenHelper } from "src/core/helpers/token-helper";
import { MailSender } from "src/core/lib/mail-sender/mail-sender";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { Result, failure, success } from "src/core/result";
import { UsersRepository } from "../../repositories/users-repository";

interface ForgotPasswordUseCaseRequest {
  email: string;
}

type ForgotPasswordUseCaseResponse = Result<
  NotFoundError,
  {
    message: string;
  }
>;

export class ForgotPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private redisServices: IRedisService,
    private mailSender: MailSender
  ) {}
  async execute({
    email,
  }: ForgotPasswordUseCaseRequest): Promise<ForgotPasswordUseCaseResponse> {
    // Recuperar usuário
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));
    if (!user.active) return failure(new NotFoundError("Usuário inativado."));

    // Gerar código de recuperação de senha
    const recoveryCode = StringHelper.generateRandomCode(15);

    // remover cache de autenticação do usuário
    const keyAccessToken = TokenHelper.getAccessTokenKey(user.id.toString());
    await this.redisServices.delete(keyAccessToken);

    // incluir cache de código de recuperação de senha
    const trintaMinutosEmSegundos = 60 * 30;
    const keyRecoveryCode = TokenHelper.getRecoveryCodeKey(recoveryCode);
    await this.redisServices.set(
      keyRecoveryCode,
      user.id.toString(),
      trintaMinutosEmSegundos
    );

    // Gerar link de recuperação de senha
    const url = new URL("/login", env.PROJECT_WEBSITE);
    url.searchParams.set("code", keyRecoveryCode);
    const link = url.toString();
    await this.mailSender.sendEmail({
      fromName: env.SMTP_NAME,
      fromEmail: env.SMTP_MAIL ?? env.SMTP_USER,
      to: user.email,
      subject: `${env.PROJECT_NAME} - Recuperação de Senha`,
      bodyMessage: `<div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <div class="header" style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333333;">Olá ${user.fullName},</div>
          <div class="content" style="font-size: 16px; color: #666666; line-height: 1.5; text-align: center;">
            <div>
              <strong>${env.PROJECT_NAME}</strong><br />

              Você solicitou uma recuperação de senha.
              <br />
              Clique no botão abaixo para redefinir sua senha:
            </div>

            <a href="${link}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 20px; font-size: 18px; font-weight: bold; text-decoration: none; margin: 20px auto; border-radius: 5px;">Redefinir Senha</a>

            <div style="font-size: 13px; color: #777777; margin-top: 10px; text-align: center;">Se o botão não funcionar, copie e cole o link no seu navegador:</div>
            <div style="word-wrap: break-word; font-size: 12px; color: #999999; margin-top: 5px; text-align: center;">${link}</div>
          </div>

          <div class="footer" style="font-size: 14px; color: #999999; margin-top: 20px; text-align: center;">
            Atenciosamente, 
            <br />
            <strong>${env.SMTP_NAME}</strong>
          </div>
        </div>`,
    });

    // Tudo certo
    return success({
      message: "E-mail de recuperação de senha encaminhado com sucesso.",
    });
  }
}
