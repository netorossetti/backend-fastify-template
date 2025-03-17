import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { UnauthorizedError } from "src/core/errors/unauthorized-error";
import { TokenHelper } from "src/core/helpers/token-helper";
import { HashCompare } from "src/core/lib/criptography/hash-compare";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { Result, failure, success } from "src/core/result";
import { UsersRepository } from "../repositories/usuarios-repository";

interface LoginUseCaseRequest {
  email: string;
  password: string;
}

type LoginUseCaseResponse = Result<
  NotFoundError | UnauthorizedError | NotAllowedError,
  { token: string }
>;

export class LoginUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hasher: HashCompare,
    private redisServices: IRedisService
  ) {}
  async execute({
    email,
    password,
  }: LoginUseCaseRequest): Promise<LoginUseCaseResponse> {
    // Recuperar usuário
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return failure(new NotFoundError("E-mail inválido."));
    if (!user.password)
      return failure(new NotFoundError("Senha não definida."));

    // Verificar senha
    const senhaValida = await this.hasher.compare(password, user.password);
    if (!senhaValida) return failure(new UnauthorizedError("Senha inválida."));

    // Verificar se o usuário está ativo
    if (!user.active) {
      return failure(new NotAllowedError("Acesso negado. Usuário inátivado."));
    }

    // Geração do token
    const token = TokenHelper.singToken({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Registrar token de acesso no cache do redis
    const seteHorasEmSegundos = 60 * 60 * 7;
    this.redisServices.set(
      `access_token:${user.id.toString()}`,
      token,
      seteHorasEmSegundos
    );

    return success({ token });
  }
}
