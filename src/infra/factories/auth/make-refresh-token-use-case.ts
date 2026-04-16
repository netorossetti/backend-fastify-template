import redisServices from "src/core/lib/redis/redis-services.js";
import { RefreshTokenUseCase } from "src/domain/application/use-cases/auth/refresh-token-use-case.js";

export function makeRefreshTokenUseCase() {
  return new RefreshTokenUseCase(redisServices);
}
