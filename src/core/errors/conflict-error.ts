import { BaseError } from "./base-error";

export class ConflictError extends BaseError {
  public name: string = "Conflict";

  constructor(message?: string) {
    super(409, message ?? "Conflict error.");
  }
}
