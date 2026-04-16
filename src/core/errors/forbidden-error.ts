import { BaseError } from "./base-error.js";

export class ForbiddenError extends BaseError {
  public name: string = "Forbidden";

  constructor(message?: string) {
    super(403, message ?? "Insufficient permissions.");
  }
}
