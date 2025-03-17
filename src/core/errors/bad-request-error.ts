export class BadRequestError extends Error {
  public name: string = "BadRequestError";
  public issues?: Record<string, string[] | undefined>;

  constructor(message?: string, issues?: Record<string, string[] | undefined>) {
    super(message ?? "Bad request.");
    this.issues = issues;
  }
}
