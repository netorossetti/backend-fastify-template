import { PrismaClient } from "prisma/generated/prisma/client.js";
import { getPrisma } from "src/infra/database/prisma.js";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher.js";
import request from "supertest";
import { MembershipFactory } from "test/factories/make-membership.js";
import { TenantFactory } from "test/factories/make-tenant.js";
import { UserFactory } from "test/factories/make-user.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("Auth - Login (e2e)", () => {
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

  test("Deve ser possível se autenticar", async () => {
    const passwordHash = await bcryptHasher.hash("Test&1234");
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      nickName: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });
    const tenant = await tenantFactory.makePrismaTenant();
    await membershipFactory.makePrismaMembership({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });

    const response = await request(app.server).post("/auth/login").send({
      email: "johndoe@example.com",
      password: "Test&1234",
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );
  });
});
