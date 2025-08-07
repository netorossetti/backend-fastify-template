import { User } from "src/domain/enterprise/entities/user";
import z from "zod/v4";

export class UserProfilePresenter {
  static toHttp(user: User): z.infer<typeof schemaUserProfilePresenter> {
    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
    };
  }
}

export const schemaUserProfilePresenter = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nickName: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullish(),
});
