import { ZodError, ZodIssue } from "zod/v4";

export class BadRequestQueryError extends ZodError {
  public name = "BadRequestQueryError";
  public statusCode = 400;
  public invalidQueryType: "filtro" | "ordenação" | "paginação";

  constructor(
    invalidQueryType: "filtro" | "ordenação" | "paginação",
    errors: ZodIssue[]
  ) {
    super(errors); // Chama o construtor do ZodError

    // Corrige o protótipo para suportar instanceof
    Object.setPrototypeOf(this, new.target.prototype);

    this.invalidQueryType = invalidQueryType;
  }
}
