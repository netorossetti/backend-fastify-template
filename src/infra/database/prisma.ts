import { PrismaClient } from "@prisma/client";
import { env } from "src/core/env";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "production" ? ["error", "warn"] : undefined,
});
