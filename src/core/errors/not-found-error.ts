export class NotFoundError extends Error {
  public name: string = "ResourceNotFoundError";

  constructor(message?: string) {
    super(message ?? "Resource not found.");
  }
}
