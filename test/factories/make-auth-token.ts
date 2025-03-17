import { TokenHelper } from "src/core/helpers/token-helper";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { User } from "src/domain/auth/enterprise/entities/user";

export function makeAuthToken(user: User, redisService: IRedisService) {
  // Geração do token
  const token = TokenHelper.singToken({
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  // Registrar token de acesso no cache do redis
  const seteHorasEmSegundos = 60 * 60 * 7;
  redisService.set(
    `access_token:${user.id.toString()}`,
    token,
    seteHorasEmSegundos
  );

  return token;
}

export class AuthTokenFactory {
  constructor(private redisService: IRedisService) {}

  async makeAuthToken(user: User): Promise<string> {
    return makeAuthToken(user, this.redisService);
  }
}
