import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Authenticate (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível se registrar", async () => {
    const response = await request(app.server).post("/auth/register").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "Teste@1234",
    });

    expect(response.statusCode).toEqual(201);
  });
});
