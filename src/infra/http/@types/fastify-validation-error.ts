import type { FastifySchemaValidationError } from "fastify";

type FastifyValidationErrorLike = {
  code: "FST_ERR_VALIDATION";
  validation?: FastifySchemaValidationError[];
};

export function isFastifyValidationError(error: unknown): error is FastifyValidationErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as any).code === "FST_ERR_VALIDATION" &&
    "validation" in error &&
    Array.isArray((error as any).validation)
  );
}
