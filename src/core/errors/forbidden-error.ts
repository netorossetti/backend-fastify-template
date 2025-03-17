export class ForbiddenError extends Error {
  public name: string = "Forbidden";

  constructor(message?: string) {
    super(message ?? "Insufficient permissions.");
  }
}
