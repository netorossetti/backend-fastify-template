import { BaseError } from "./base-error.js";

export class UnauthorizedError extends BaseError {
  public name: string = "UnauthorizedError";

  constructor(message?: string) {
    super(401, message ?? "Unauthorized.");
  }
}
