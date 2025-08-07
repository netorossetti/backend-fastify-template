import { env } from "src/core/env";
import { TokenHelper } from "src/core/helpers/token-helper";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { Membership } from "src/domain/enterprise/entities/membership";
import { User } from "src/domain/enterprise/entities/user";

export function makeAuthToken(
  user: User,
  menbership: Membership,
  redisService: IRedisService
) {
  // Geração do token
  const token = TokenHelper.singToken({
    id: user.id.toString(),
    name: user.nickName,
    email: user.email,
    role: menbership.role,
    tenantId: menbership.tenantId,
  });

  // Registrar token de acesso no cache do redis
  const keyAccessToken = TokenHelper.getAccessTokenKey(user.id.toString());
  redisService.set(keyAccessToken, token, env.JWT_EXP);

  return token;
}

export class AuthTokenFactory {
  constructor(private redisService: IRedisService) {}

  async makeAuthToken(user: User, menbership: Membership): Promise<string> {
    return makeAuthToken(user, menbership, this.redisService);
  }
}
