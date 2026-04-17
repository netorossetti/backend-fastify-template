import Redis from "ioredis";
import { env } from "src/core/env";

export interface IRedisService {
  set<T>(key: string, value: T, expire?: number, nx?: boolean): Promise<boolean>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<boolean>;
  client: Redis; // 👈 expõe o cliente
}

class RedisService implements IRedisService {
  public client: Redis;

  constructor() {
    this.client = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    });
  }

  async set<T>(key: string, value: T, expire?: number, nx?: boolean): Promise<boolean> {
    const stringValue = JSON.stringify(value);
    let result: string | null;

    if (nx) {
      // Se nx for true, usamos a flag 'NX'. O ioredis retorna "OK" ou null.
      if (expire) result = await this.client.set(key, stringValue, "EX", expire, "NX");
      else result = await this.client.set(key, stringValue, "NX");
    } else {
      // Comportamento padrão de sobrescrever
      if (expire) result = await this.client.set(key, stringValue, "EX", expire);
      else result = await this.client.set(key, stringValue);
    }

    return result === "OK";
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    if (!result) return null;

    try {
      return JSON.parse(result) as T; // 👈 Cast para o tipo genérico
    } catch {
      // Caso o dado no Redis não seja um JSON válido
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    return result === 1;
  }
}

export default new RedisService();
