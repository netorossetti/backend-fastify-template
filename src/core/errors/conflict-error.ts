export class ConflictError extends Error {
  public name: string = "Conflict";

  constructor(message?: string) {
    super(message ?? "Conflict error.");
  }
}
