import { BaseError } from "./base-error.js";

export class NotAllowedError extends BaseError {
  public name: string = "NotAllowedError";

  constructor(message?: string) {
    super(405, message ?? "Not allowed error.");
  }
}
