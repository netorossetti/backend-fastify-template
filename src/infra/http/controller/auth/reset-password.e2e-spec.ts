import redisServices from "src/core/lib/redis/redis-services";
import { prisma } from "src/infra/database/prisma";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher";
import request from "supertest";
import { MembershipFactory } from "test/factories/make-membership";
import { RecoveryCodeFactory } from "test/factories/make-recovery-code";
import { TenantFactory } from "test/factories/make-tenant";
import { UserFactory } from "test/factories/make-user";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Auth - ResetPassword (e2e)", () => {
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

  test("Deve ser possível redefinir uma senha", async () => {
    const passwordHash = await bcryptHasher.hash("Test&1234");
    const user = await userFactory.makePrismaUser({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    const recoveryCodeFactory = new RecoveryCodeFactory(redisServices);
    const recoveryCode = await recoveryCodeFactory.makeRecoveryCode(user);

    const response = await request(app.server)
      .post("/auth/reset-password")
      .send({
        recoveryCode,
        password: "2014@Recovery",
        passwordCheck: "2014@Recovery",
      });

    expect(response.statusCode).toEqual(204);
  });
});
