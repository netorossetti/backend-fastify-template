import { faker } from "@faker-js/faker";
import { StringHelper } from "src/core/helpers/string-helper";
import redisServices from "src/core/lib/redis/redis-services";
import { prisma } from "src/infra/database/prisma";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token";
import { MembershipFactory } from "test/factories/make-membership";
import { TenantFactory } from "test/factories/make-tenant";
import { UserFactory } from "test/factories/make-user";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Membership - CreateNewUserAccess (e2e)", () => {
  let userFactory: UserFactory;
  let tenantFactory: TenantFactory;
  let membershipFactory: MembershipFactory;

  beforeAll(async () => {
    userFactory = new UserFactory(prisma);
    tenantFactory = new TenantFactory(prisma);
    membershipFactory = new MembershipFactory(prisma);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível criar um novo acesso de usuário.", async () => {
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "passwordHash",
    });
    const tenant = await tenantFactory.makePrismaTenant();
    const membership = await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      owner: true,
      role: "superAdmin",
    });

    // Autenticar no tenant 1
    const authTokenFactory = new AuthTokenFactory(redisServices);
    const accessToken = await authTokenFactory.makeAuthToken(user, membership);

    const firstName = faker.person.firstName();

    const response = await request(app.server)
      .post("/memberships/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        firstName: StringHelper.truncate(firstName, 50),
        lastName: StringHelper.truncate(faker.person.lastName(), 50),
        nickName: StringHelper.truncate(firstName, 50),
        email: faker.internet.email({ firstName: firstName }),
        role: "user",
      });

    if (response.statusCode !== 204) console.log(response.body);

    expect(response.statusCode).toEqual(204);
  });
});
