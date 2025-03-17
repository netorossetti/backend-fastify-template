import redisServices from "src/core/lib/redis/redis-services";
import { RefreshTokenUseCase } from "src/domain/auth/application/use-cases/refresh-token-use-case";

export function makeRefreshTokenUseCase() {
  return new RefreshTokenUseCase(redisServices);
}
