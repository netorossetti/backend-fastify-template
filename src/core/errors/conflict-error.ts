import { BaseError } from "./base-error.js";

export class ConflictError extends BaseError {
  public name: string = "Conflict";

  constructor(message?: string) {
    super(409, message ?? "Conflict error.");
  }
}
