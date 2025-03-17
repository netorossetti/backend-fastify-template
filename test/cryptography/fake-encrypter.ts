import { Decrypter } from "src/core/lib/criptography/decrypter";
import { Encrypter } from "src/core/lib/criptography/encrypter";

export class FakeEncrypter implements Encrypter, Decrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload);
  }

  async decrypter(encryptValue: string): Promise<Record<string, unknown>> {
    return JSON.parse(encryptValue);
  }
}
