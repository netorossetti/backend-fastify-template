import { faker } from "@faker-js/faker";
import { StringHelper } from "src/core/helpers/string-helper";
import request from "supertest";
import * as cnpj from "validation-br/dist/cnpj";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app";

describe("Tenant - CreateTenant (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("Deve ser possível se registrar", async () => {
    const firstName = faker.person.firstName();

    const response = await request(app.server)
      .post("/tenants")
      .send({
        firstName: StringHelper.truncate(firstName, 50),
        lastName: StringHelper.truncate(faker.person.lastName(), 50),
        nickName: StringHelper.truncate(firstName, 50),
        email: faker.internet.email({ firstName: firstName }),
        password: "Teste@2016",
        organization: {
          name: StringHelper.truncate(faker.person.fullName(), 200),
          nickName: StringHelper.truncate(faker.person.firstName(), 50),
          documentType: "CNPJ",
          documentNumber: cnpj.fake({ withMask: true, alphanumeric: false }),
        },
      });

    expect(response.statusCode).toEqual(204);
  });
});
