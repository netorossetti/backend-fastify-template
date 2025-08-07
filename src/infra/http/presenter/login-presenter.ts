import z from "zod/v4";

export class LoginPresenter {
  static toHttp(login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      tenantId: string;
      role: string;
    };
    tenants: {
      id: string;
      name: string;
    }[];
  }): z.infer<typeof schemaLoginPresenter> {
    return {
      token: login.token,
      user: {
        id: login.user.id,
        name: login.user.name,
        email: login.user.email,
        currentTenantId: login.user.tenantId,
        role: login.user.role,
      },
      accounts: login.tenants.map((t) => {
        return {
          id: t.id,
          name: t.name,
        };
      }),
    };
  }
}

export const schemaLoginPresenter = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    currentTenantId: z.string(),
    role: z.string(),
  }),
  accounts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});
