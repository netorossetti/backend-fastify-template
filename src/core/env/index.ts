import "dotenv/config";
import ms from "ms";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url(),
  JWT_KEY: z.string().min(10),
  JWT_EXP: z
    .union([z.coerce.number(), z.string().regex(/^[0-9]+[smhd]$/)])
    .transform((val) => {
      try {
        if (typeof val === "string") return ms(val as ms.StringValue);
      } catch (error) {
        throw new Error("JWT_EXP: Valor inválido para ms.StringValue");
      }
    }),
  LOGGER_FOLDER: z.string().optional(),
  LOGGER_FILENAME: z.string().optional(),
  ENCRYPTION_KEY: z.string().min(10),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
});

const _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables.", _env.error.format());
  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
