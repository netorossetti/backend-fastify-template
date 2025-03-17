export interface Decrypter {
  decrypter(encryptValue: string): Promise<Record<string, unknown>>;
}
