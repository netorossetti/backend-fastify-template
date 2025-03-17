import JWT from "jsonwebtoken";
import z from "zod";
import { env } from "../env";

const decodedSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  regra: z.enum(["user", "admin", "superAdmin"]),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});

export type InfoToken = z.infer<typeof decodedSchema>;

export interface payloadToken {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class TokenHelper {
  static decodedToken(token: string): InfoToken {
    const decoded = JWT.verify(token, env.JWT_KEY);
    const parsed = decodedSchema.safeParse(decoded);
    if (!parsed.success) throw new Error("Falha ao decodificar o token");
    return parsed.data;
  }

  static singToken = ({ id, name, email, role }: payloadToken) => {
    const token = JWT.sign(
      {
        id: id,
        name: name,
        email: email,
        role: role,
      },
      env.JWT_KEY,
      { expiresIn: env.JWT_EXP }
    );
    return token;
  };
}
