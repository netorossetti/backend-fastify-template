export class UnauthorizedError extends Error {
  public name: string = "UnauthorizedError";

  constructor(message?: string) {
    super(message ?? "Unauthorized.");
  }
}
