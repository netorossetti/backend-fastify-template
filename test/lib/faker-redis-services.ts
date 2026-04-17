import Redis from "ioredis";
import { IRedisService } from "src/core/lib/redis/redis-services";

export class FakerRedisServices implements IRedisService {
  public client: Redis;
  constructor() {
    this.client = new Redis();
  }

  private store: Map<string, { value: any; expireAt?: number }> = new Map();

  async set(key: string, value: any, expire?: number, nx?: boolean): Promise<boolean> {
    const now = Date.now();
    const existing = this.store.get(key);

    // Lógica de expiração: se existia mas expirou, tratamos como se não existisse
    const isExpired = existing?.expireAt && now > existing.expireAt;

    if (nx && existing && !isExpired) {
      // Se pediu NX e a chave já existe (e está válida), falha na aquisição
      return false;
    }

    // Se chegou aqui, ou não é NX, ou a chave não existe/expirou
    const expireAt = expire ? now + expire * 1000 : undefined;
    this.store.set(key, { value, expireAt });

    return true; // Sucesso (equivale ao "OK" do Redis)
  }

  async get(key: string): Promise<any | null> {
    const data = this.store.get(key);

    if (!data) return null;

    // Se a chave expirou, remove e retorna null
    if (data.expireAt && Date.now() > data.expireAt) {
      this.store.delete(key);
      return null;
    }

    return data.value;
  }

  async delete(key: string): Promise<boolean> {
    const isRemoved = this.store.delete(key);
    return isRemoved;
  }

  // Método auxiliar para testes: verificar se uma chave ainda existe no mock
  hasKey(key: string): boolean {
    return this.store.has(key);
  }
}
