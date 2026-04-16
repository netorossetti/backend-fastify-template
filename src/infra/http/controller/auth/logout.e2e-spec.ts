import { PrismaClient } from "prisma/generated/prisma/client.js";
import redisServices from "src/core/lib/redis/redis-services.js";
import { getPrisma } from "src/infra/database/prisma.js";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher.js";
import request from "supertest";
import { AuthTokenFactory } from "test/factories/make-auth-token.js";
import { MembershipFactory } from "test/factories/make-membership.js";
import { TenantFactory } from "test/factories/make-tenant.js";
import { UserFactory } from "test/factories/make-user.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("Auth - Logout (e2e)", () => {
  let userFactory: UserFactory;
  let tenantFactory: TenantFactory;
  let membershipFactory: MembershipFactory;
  let bcryptHasher: BcryptHasher;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = getPrisma();
    userFactory = new UserFactory(prisma);
    tenantFactory = new TenantFactory(prisma);
    membershipFactory = new MembershipFactory(prisma);
    bcryptHasher = new BcryptHasher();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível realizar logout do sistema", async () => {
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
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toEqual(204);
  });
});
