import { NotFoundError } from "src/core/errors/not-found-error";
import { UnauthorizedError } from "src/core/errors/unauthorized-error";
import { InfoToken, TokenHelper } from "src/core/helpers/token-helper";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { failure, Result, success } from "src/core/result";

interface RefreshTokenUseCaseRequest {
  usuarioId: string;
  token: string;
}

type RefreshTokenUseCaseResponse = Result<
  NotFoundError | UnauthorizedError,
  { token: string }
>;

export class RefreshTokenUseCase {
  constructor(private redisServices: IRedisService) {}

  async execute({
    usuarioId,
    token,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    // Validar token recebido com o token do redis
    const redisToken = (await this.redisServices.get(
      `access_token:${usuarioId}`
    )) as string;
    if (token !== redisToken) return failure(new UnauthorizedError());

    // Decodificar token
    let payload: InfoToken;
    try {
      payload = TokenHelper.decodedToken(token);
    } catch (error) {
      return failure(new UnauthorizedError());
    }

    if (!payload.exp || !payload.iat)
      return failure(new NotFoundError("Falha na decodificação do token"));

    const tempoRefresh = (payload.exp - payload.iat) / 2;
    const dataRefresh = payload.iat + tempoRefresh;
    const dataAtual = Math.trunc(new Date().getTime() / 1000);

    // Token Válido
    if (dataRefresh >= dataAtual) return success({ token });

    // Token Expirado
    const newtoken = TokenHelper.singToken({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    });

    // Atualiza token do cache
    const seteHorasEmSegundos = 7 * 60 * 60;
    this.redisServices.set(
      `access_token:${usuarioId}`,
      newtoken,
      seteHorasEmSegundos
    );

    // Tudo certo
    return success({ token: newtoken });
  }
}
