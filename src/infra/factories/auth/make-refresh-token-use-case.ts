import redisServices from "src/core/lib/redis/redis-services";
import { RefreshTokenUseCase } from "src/domain/application/use-cases/auth/refresh-token-use-case";

export function makeRefreshTokenUseCase() {
  return new RefreshTokenUseCase(redisServices);
}
