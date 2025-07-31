import { ZodError, ZodIssue } from "zod/v4";

export class BadRequestQueryError extends ZodError {
  public name: string = "BadRequestQueryError";
  public invalidQueryType: string = "";
  constructor(
    invalidQueryType: "filtro" | "ordenação" | "paginação",
    errors: ZodIssue[]
  ) {
    super(errors);
    this.invalidQueryType = invalidQueryType;
  }
}
