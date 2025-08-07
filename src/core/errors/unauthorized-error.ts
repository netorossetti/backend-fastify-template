import { BaseError } from "./base-error";

export class UnauthorizedError extends BaseError {
  public name: string = "UnauthorizedError";

  constructor(message?: string) {
    super(401, message ?? "Unauthorized.");
  }
}
