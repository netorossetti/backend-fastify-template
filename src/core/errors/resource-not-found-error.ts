export class ResourceNotFoundError extends Error {
  public name: string = "ResourceNotFoundError";

  constructor(message?: string) {
    super(message ?? "Resource not found.");
  }
}
