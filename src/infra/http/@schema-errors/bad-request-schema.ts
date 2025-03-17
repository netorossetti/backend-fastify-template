import z from "zod";

export const schemaBadRequest = z.object({
  message: z.string(),
  issues: z.any().optional(),
});
