export class BaseError extends Error {
  public statusCode: number;
  public name: string;

  constructor(statusCode: number = 500, message: string = "Conflict error.") {
    super(message);

    // Ajusta o protótipo explicitamente (necessário em algumas versões do TypeScript/Node)
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "Conflict";
    this.statusCode = statusCode;
  }
}
