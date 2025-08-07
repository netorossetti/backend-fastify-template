import CryptoJS from "crypto-js";
import { env } from "src/core/env";
import { Decrypter } from "src/core/lib/criptography/decrypter";
import { Encrypter } from "src/core/lib/criptography/encrypter";

export class CryptoJSCrypter implements Encrypter, Decrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    const payloadString = JSON.stringify(payload);
    const encryptValue = CryptoJS.AES.encrypt(
      payloadString,
      env.ENCRYPTION_KEY
    ).toString();
    return encryptValue;
  }

  async decrypter(encryptValue: string): Promise<Record<string, unknown>> {
    const decrypted = CryptoJS.AES.decrypt(
      encryptValue,
      env.ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
    const decryptedJson = JSON.parse(decrypted);
    return decryptedJson;
  }
}
