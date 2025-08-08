import "dotenv/config";
import ms from "ms";
import { z } from "zod/v4";
import { zodIsFolderSchema } from "../types/zod-custom-types/is-folder-schema";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default("0.0.0.0"),
  PROJECT_NAME: z.string(),
  PROJECT_VERSION: z.string(),
  PROJECT_WEBSITE: z.url(),
  DATABASE_URL: z.url(),
  JWT_KEY: z.string().min(10),
  JWT_EXP: z
    .union([z.coerce.number(), z.string().regex(/^[0-9]+[smhd]$/)])
    .transform((val) => {
      try {
        if (typeof val === "string") return ms(val as ms.StringValue) / 1000;
      } catch (error) {
        throw new Error("JWT_EXP: Valor inválido para ms.StringValue");
      }
    }),
  LOGGER_FOLDER: zodIsFolderSchema({ allowRelativePath: true }).optional(),
  LOGGER_FILENAME: z.string().optional(),
  UPLOADS_PUBLIC_PATH: zodIsFolderSchema({ allowRelativePath: false }),
  UPLOADS_PRIVATE_PATH: zodIsFolderSchema({ allowRelativePath: false }),
  ENCRYPTION_KEY: z.string().min(10),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_NAME: z.string(),
  SMTP_MAIL: z.email().optional(),
  SMTP_USER: z.email(),
  SMTP_PASS: z.string(),
});

const _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables.", _env.error.format());
  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
