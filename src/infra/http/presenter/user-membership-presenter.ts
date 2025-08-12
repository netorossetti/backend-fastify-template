import { jsonSchema } from "src/core/types/json";
import { UserWithMembership } from "src/domain/enterprise/entities/value-objects/user-with-membership";
import z from "zod/v4";

export class UserMembershipPresenter {
  static toHttp(
    user: UserWithMembership
  ): z.infer<typeof schemaUserMembershipPresenter> {
    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      owner: user.owner,
      role: user.role,
      permissions: user.permissions ?? null,
      lastAccessAt: user.lastAccessAt,
      active: user.active,
    };
  }
}

export const schemaUserMembershipPresenter = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nickName: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullish(),
  owner: z.boolean(),
  role: z.string(),
  permissions: jsonSchema.nullish(),
  lastAccessAt: z.date().nullish(),
  active: z.boolean(),
});
