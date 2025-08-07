import z from "zod/v4";

export const schemaResponseError = z.object({
  statusCode: z.number(),
  message: z.string(),
  issues: z.record(z.string(), z.any().optional()).optional(),
});
