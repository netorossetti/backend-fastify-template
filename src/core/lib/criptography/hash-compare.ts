export interface HashCompare {
  compare(plain: string, hash: string): Promise<boolean>;
}
