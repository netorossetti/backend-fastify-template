import { PrismaClient } from "prisma/generated/prisma/client.js";
import redisServices from "src/core/lib/redis/redis-services.js";
import { getPrisma } from "src/infra/database/prisma.js";
import { BcryptHasher } from "src/infra/lib/criptography/bcrypt-hasher.js";
import request from "supertest";
import { RecoveryCodeFactory } from "test/factories/make-recovery-code.js";
import { UserFactory } from "test/factories/make-user.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("Auth - ResetPassword (e2e)", () => {
  let userFactory: UserFactory;
  let bcryptHasher: BcryptHasher;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = getPrisma();
    userFactory = new UserFactory(prisma);
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

    const response = await request(app.server).post("/auth/reset-password").send({
      recoveryCode,
      password: "2014@Recovery",
      passwordCheck: "2014@Recovery",
    });

    expect(response.statusCode).toEqual(204);
  });
});
