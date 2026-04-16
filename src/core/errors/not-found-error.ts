import { BaseError } from "./base-error.js";

export class NotFoundError extends BaseError {
  public name: string = "NotFoundError";

  constructor(message?: string) {
    super(404, message ?? "Resource not found.");
  }
}
