import z from "zod";

export const schemaResponseError = z.object({
  message: z.string(),
});
