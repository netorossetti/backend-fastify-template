import { env } from "src/core/env";
import { StringHelper } from "src/core/helpers/string-helper";
import { TokenHelper } from "src/core/helpers/token-helper";
import { IRedisService } from "src/core/lib/redis/redis-services";
import { User } from "src/domain/enterprise/entities/user";

export function makeRecoveryCode(user: User, redisService: IRedisService) {
  // Registrar token de acesso no cache do redis
  const recoveryCode = StringHelper.generateRandomCode(15);
  const keyAccessToken = TokenHelper.getRecoveryCodeKey(recoveryCode);
  redisService.set(keyAccessToken, user.id.toString(), env.JWT_EXP);
  return recoveryCode;
}

export class RecoveryCodeFactory {
  constructor(private redisService: IRedisService) {}

  async makeRecoveryCode(user: User): Promise<string> {
    return makeRecoveryCode(user, this.redisService);
  }
}
