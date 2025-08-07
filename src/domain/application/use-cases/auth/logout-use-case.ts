import { NotFoundError } from "src/core/errors/not-found-error";
import { TokenHelper } from "src/core/helpers/token-helper";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { Result, failure, success } from "src/core/result";
import { UsersRepository } from "../../repositories/users-repository";

interface LogoutUseCaseRequest {
  userId: string;
}

type LogoutUseCaseResponse = Result<NotFoundError, {}>;

export class LogoutUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private redisServices: IRedisService
  ) {}
  async execute({
    userId,
  }: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    // Recuperar usuário
    const user = await this.usersRepository.findById(userId);
    if (!user) return failure(new NotFoundError("Usuário não localizado."));

    // Registrar token de acesso no cache do redis
    const keyAccessToken = TokenHelper.getAccessTokenKey(user.id.toString());
    await this.redisServices.delete(keyAccessToken);

    return success({});
  }
}
