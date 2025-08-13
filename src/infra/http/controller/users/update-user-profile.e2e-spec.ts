import { createReadStream } from "fs";
import path from "path";
import redisServices from "src/core/lib/redis/redis-services";
import { prisma } from "src/infra/database/prisma";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token";
import { MembershipFactory } from "test/factories/make-membership";
import { TenantFactory } from "test/factories/make-tenant";
import { UserFactory } from "test/factories/make-user";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Users - UpdateUserProfile (e2e)", () => {
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

  test("Deve ser possível obter o perfil do usuário", async () => {
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
    });
    const tenant1 = await tenantFactory.makePrismaTenant();
    const membership1 = await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant1.id.toString(),
    });

    // Autenticar no tenant 1
    const authTokenFactory = new AuthTokenFactory(redisServices);
    const accessToken = await authTokenFactory.makeAuthToken(user, membership1);

    const avatarPath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "..",
      "test",
      "avatar",
      "avatar.jpg"
    );

    const response = await request(app.server)
      .put("/users/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("avatar", createReadStream(avatarPath)) // upload do arquivo
      .field("firstName", "Jonathan")
      .field("lastName", "Doe Updated")
      .field("nickName", "Jonny");

    expect(response.statusCode).toEqual(204);
  });
});
