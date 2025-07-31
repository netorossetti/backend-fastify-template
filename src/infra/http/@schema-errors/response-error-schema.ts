import z from "zod/v4";

export const schemaResponseError = z.object({
  message: z.string(),
});
