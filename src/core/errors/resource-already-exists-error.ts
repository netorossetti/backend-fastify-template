export class ResourceAlreadyExistsError extends Error {
  public name: string = "ResourceAlreadyExistsError";

  constructor(message?: string) {
    super(message ?? "Resource already exists.");
  }
}
