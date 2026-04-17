import { faker } from "@faker-js/faker";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id.js";
import { BadRequestError } from "src/core/errors/bad-request-error.js";
import { ConflictError } from "src/core/errors/conflict-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeTenant } from "test/factories/make-tenant.js";
import { makeUser } from "test/factories/make-user.js";
import * as cnpj from "validation-br/dist/cnpj";
import { CreateTenantUseCase } from "./create-tenant-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: CreateTenantUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new CreateTenantUseCase(
      ctx.tenantsRepository,
      ctx.usersRepository,
      ctx.membershipsRepository,
      ctx.fakerHasher,
    );
  });

  test("Deve ser possivel criar um novo tenant", async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const result = await sut.execute({
      firstName,
      lastName,
      email: faker.internet.email({ firstName }),
      password: "Teste@1234",
      tenant: {
        documentNumber: cnpj.fake({ alphanumeric: false }),
        documentType: "CNPJ",
        name: "Organização Teste LTDA",
        nickName: "Org Teste",
      },
    });
    expect(result.isSuccess()).toBe(true);
    expect(ctx.usersRepository.items.length).toEqual(1);
    expect(ctx.tenantsRepository.items.length).toEqual(1);
    expect(ctx.membershipsRepository.items.length).toEqual(1);
    expect(ctx.usersRepository.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ nickName: firstName })]),
    );
  });

  test("Não deve ser possível criar um tenant com um mesmo numero de decumento", async () => {
    const documentNumber = cnpj.fake({ alphanumeric: false });
    ctx.tenantsRepository.items.push(makeTenant({ documentType: "CNPJ", documentNumber }));

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const result = await sut.execute({
      firstName,
      lastName,
      email: faker.internet.email({ firstName }),
      password: "Teste@1234",
      tenant: {
        documentNumber: documentNumber,
        documentType: "CNPJ",
        name: "Organização Teste LTDA",
        nickName: "Org Teste",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(ConflictError);
      expect(result.value.message).toBe("Organização já foi registrada com o documento informado.");
    }
  });

  test("Não deve ser possível criar um tenant com CPF inválido", async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const result = await sut.execute({
      firstName,
      lastName,
      email: faker.internet.email({ firstName }),
      password: "Teste@1234",
      tenant: {
        documentNumber: "00000000000",
        documentType: "CPF",
        name: "Organização Teste LTDA",
        nickName: "Org Teste",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe("Numero do documento informado não é um CPF válido.");
    }
  });

  test("Não deve ser possível criar um tenant com CNPJ inválido", async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const result = await sut.execute({
      firstName,
      lastName,
      email: faker.internet.email({ firstName }),
      password: "Teste@1234",
      tenant: {
        documentNumber: "00000000000000",
        documentType: "CNPJ",
        name: "Organização Teste LTDA",
        nickName: "Org Teste",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe("Numero do documento informado não é um CNPJ válido.");
    }
  });

  test("Não deve ser possível criar um tenant com CNH inválido", async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const result = await sut.execute({
      firstName,
      lastName,
      email: faker.internet.email({ firstName }),
      password: "Teste@1234",
      tenant: {
        documentNumber: "00000000000",
        documentType: "CNH",
        name: "Organização Teste LTDA",
        nickName: "Org Teste",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe("Numero do documento informado não é um CNH válido.");
    }
  });

  test("Dev ser possível criar um tenant para um usuário já registrado", async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = makeUser(
      {
        firstName,
        lastName,
        nickName: firstName,
        email: faker.internet.email({ firstName }),
      },
      new UniqueEntityId(),
    );
    ctx.usersRepository.items.push(user);

    const result = await sut.execute({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "Teste@1234",
      tenant: {
        documentNumber: cnpj.fake({ alphanumeric: false }),
        documentType: "CNPJ",
        name: "Organização Teste LTDA",
        nickName: "Org Teste",
      },
    });

    expect(result.isSuccess()).toBe(true);
    expect(ctx.usersRepository.items.length).toEqual(1);
    expect(ctx.tenantsRepository.items.length).toEqual(1);
    expect(ctx.membershipsRepository.items.length).toEqual(1);
    expect(ctx.usersRepository.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ nickName: firstName })]),
    );
  });
});
