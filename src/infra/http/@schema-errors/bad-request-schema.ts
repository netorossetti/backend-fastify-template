import z from "zod/v4";

export const schemaBadRequest = z.object({
  message: z.string(),
  issues: z.any().optional(),
});
