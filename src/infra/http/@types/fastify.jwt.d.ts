// fastify-jwt.d.ts
import "@fastify/jwt";
import type { RoleUserType } from "src/domain/enterprise/entities/user";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      id: string;
      name: string;
      email: string;
      tenantId: string;
      role: RoleUserType;
    };
  }
}
