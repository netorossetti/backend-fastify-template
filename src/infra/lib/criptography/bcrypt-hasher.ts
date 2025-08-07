import bcryptjs from "bcryptjs";
import { HashCompare } from "src/core/lib/criptography/hash-compare";
import { HashGenerator } from "src/core/lib/criptography/hash-generator";

export class BcryptHasher implements HashGenerator, HashCompare {
  private HASH_SALT_LENGTH = 8;

  hash(plain: string): Promise<string> {
    return bcryptjs.hash(plain, this.HASH_SALT_LENGTH);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(plain, hash);
  }
}
