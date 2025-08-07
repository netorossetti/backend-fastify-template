import { IRedisService } from "src/core/lib/redis/redis-services";

export class FakeRedisServices implements IRedisService {
  private store: Map<string, { value: any; expireAt?: number }> = new Map();

  async set(key: string, value: any, expire?: number): Promise<void> {
    const expireAt = expire ? Date.now() + expire * 1000 : undefined;
    this.store.set(key, { value, expireAt });
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
