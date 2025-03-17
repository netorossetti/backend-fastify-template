export class NotAllowedError extends Error {
  public name: string = "NotAllowedError";

  constructor(message?: string) {
    super(message ?? "Not allowed error.");
  }
}
