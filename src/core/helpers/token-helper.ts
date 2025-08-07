import JWT from "jsonwebtoken";
import z from "zod/v4";
import { env } from "../env";
import { StringHelper } from "./string-helper";

const decodedSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  tenantId: z.string(),
  role: z.enum(["user", "admin", "superAdmin", ""]),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});

export type InfoToken = z.infer<typeof decodedSchema>;

export interface payloadToken {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: string;
}

export class TokenHelper {
  static decodedToken(token: string): InfoToken {
    const decoded = JWT.verify(token, env.JWT_KEY);
    const parsed = decodedSchema.safeParse(decoded);
    if (!parsed.success) throw new Error("Falha ao decodificar o token");
    return parsed.data;
  }

  static singToken = ({ id, name, email, tenantId, role }: payloadToken) => {
    const token = JWT.sign(
      {
        id: id,
        name: name,
        email: email,
        tenantId: tenantId,
        role: role,
      },
      env.JWT_KEY,
      { expiresIn: env.JWT_EXP }
    );
    return token;
  };

  static getAccessTokenKey(userId: string): string {
    return `access-token:${StringHelper.stringToSlug(
      env.PROJECT_NAME
    )}:${userId}`;
  }

  static getRecoveryCodeKey(code: string): string {
    return `recovery-code:${StringHelper.stringToSlug(
      env.PROJECT_NAME
    )}:${code}`;
  }
}
