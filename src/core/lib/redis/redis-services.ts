import Redis from "ioredis";
import { env } from "src/core/env";

export interface IRedisService {
  set(key: string, value: any, expire?: number): Promise<void>;
  get(key: string): Promise<any | null>;
  delete(key: string): Promise<boolean>;
}

class RedisService implements IRedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    });
  }

  async set(key: string, value: any, expire?: number): Promise<void> {
    if (expire) await this.client.set(key, JSON.stringify(value), "EX", expire);
    else await this.client.set(key, JSON.stringify(value));
  }

  async get(key: string): Promise<any | null> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    return result === 1;
  }
}

export default new RedisService();
