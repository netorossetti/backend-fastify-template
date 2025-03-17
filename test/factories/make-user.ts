import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client/extension";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { User, UserProps } from "src/domain/auth/enterprise/entities/user";
import { PrismaUserMapper } from "src/infra/database/repository/mappers/prisma-user-mapper";

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityId
) {
  const firstName = faker.person.firstName();
  const fullName = faker.person.fullName({ firstName });
  if (override.password) {
    if (!override.password.endsWith("-hashed"))
      override.password = override.password.concat("-hashed");
  }

  const newUser = User.create(
    {
      name: fullName,
      email: faker.internet.email({ firstName: firstName }),
      password: "p@s5Word123-hashed",
      role: "user",
      ...override,
    },
    id
  );
  return newUser;
}

export class UserFactory {
  constructor(private prisma: PrismaClient) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data);
    await this.prisma.user.create({
      data: PrismaUserMapper.toPersistent(user),
    });
    return user;
  }
}
