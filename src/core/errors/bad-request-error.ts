import { BaseError } from "./base-error";

export class BadRequestError extends BaseError {
  public name: string = "BadRequestError";
  public issues?: Record<string, string[] | undefined>;

  constructor(message?: string, issues?: Record<string, string[] | undefined>) {
    super(400, message ?? "Bad request.");
    this.issues = issues;
  }
}
