import { BadRequestError } from "src/core/errors/bad-request-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { StringHelper } from "src/core/helpers/string-helper.js";
import { TokenHelper } from "src/core/helpers/token-helper.js";
import { HashGenerator } from "src/core/lib/criptography/hash-generator.js";
import { IRedisService } from "src/core/lib/redis/redis-services.js";
import { failure, Result, success } from "src/core/result.js";
import { UsersRepository } from "../../repositories/users-repository.js";

interface ResetPasswordUseCaseRequest {
  recoveryCode: string;
  password: string;
  passwordCheck: string;
}

type ResetPasswordUseCaseResponse = Result<NotFoundError | BadRequestError, {}>;

export class ResetPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private redisServices: IRedisService,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    recoveryCode,
    password,
    passwordCheck,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    // Verifica se pode alterar
    if (password != passwordCheck)
      return failure(new BadRequestError("A senha de confirmação está diferente da nova senha."));

    // Verifica senha
    const passwordRequirements = StringHelper.passwordRequirements(password);
    if (passwordRequirements != null) {
      return failure(
        new BadRequestError("Senha inválida.", {
          password: passwordRequirements,
        }),
      );
    }

    const keyRecoveryCode = TokenHelper.getRecoveryCodeKey(recoveryCode);
    const dataCache = await this.redisServices.get(keyRecoveryCode);
    if (!dataCache) return failure(new NotFoundError("Link de recuperação expirado."));

    // Recuperar id do usuario no link de recuperação
    const userId = dataCache as string;

    // Recuperar informações do usuário
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não encontrado."));

    // Alterar senha do usuário
    user.password = await this.hashGenerator.hash(password);
    await this.usersRepository.save(user);

    // Limpar Cache
    await this.redisServices.delete(keyRecoveryCode);

    return success({});
  }
}
