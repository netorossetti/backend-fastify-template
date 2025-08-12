import redisServices from "src/core/lib/redis/redis-services";
import { prisma } from "src/infra/database/prisma";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token";
import { MembershipFactory } from "test/factories/make-membership";
import { TenantFactory } from "test/factories/make-tenant";
import { UserFactory } from "test/factories/make-user";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Auth - ForgotPassword (e2e)", () => {
  let userFactory: UserFactory;
  let tenantFactory: TenantFactory;
  let membershipFactory: MembershipFactory;
  let bcryptHasher: BcryptHasher;

  beforeAll(async () => {
    userFactory = new UserFactory(prisma);
    tenantFactory = new TenantFactory(prisma);
    membershipFactory = new MembershipFactory(prisma);
    bcryptHasher = new BcryptHasher();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível alterar a senha", async () => {
    const passwordHash = await bcryptHasher.hash("Test&1234");
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });
    const tenant = await tenantFactory.makePrismaTenant();
    const membership = await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });

    const authTokenFactory = new AuthTokenFactory(redisServices);
    const accessToken = await authTokenFactory.makeAuthToken(user, membership);

    const response = await request(app.server)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        password: "Test&1234",
        newPassword: "Test@2026",
        newPasswordCheck: "Test@2026",
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      message: "Senha alterada com sucesso!",
    });
  });
});
