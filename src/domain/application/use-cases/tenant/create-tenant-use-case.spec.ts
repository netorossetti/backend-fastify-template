import { faker } from "@faker-js/faker";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { makeTenant } from "test/factories/make-tenant";
import { makeUser } from "test/factories/make-user";
import { FakeHasher } from "test/lib/cryptography/fake-hasher";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import * as cnpj from "validation-br/dist/cnpj";
import { CreateTenantUseCase } from "./create-tenant-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let fakeHasher: FakeHasher;
let sut: CreateTenantUseCase;

describe("Login Use Case", () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    sut = new CreateTenantUseCase(
      inMemoryTenantsRepository,
      inMemoryUsersRepository,
      inMemoryMembershipsRepository,
      fakeHasher
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
    expect(inMemoryUsersRepository.items.length).toEqual(1);
    expect(inMemoryTenantsRepository.items.length).toEqual(1);
    expect(inMemoryMembershipsRepository.items.length).toEqual(1);
    expect(inMemoryUsersRepository.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ nickName: firstName })])
    );
  });

  test("Não deve ser possível criar um tenant com um mesmo numero de decumento", async () => {
    const documentNumber = cnpj.fake({ alphanumeric: false });
    inMemoryTenantsRepository.items.push(
      makeTenant({ documentType: "CNPJ", documentNumber })
    );

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
      expect(result.value.message).toBe(
        "Organização já foi registrada com o documento informado."
      );
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
      expect(result.value.message).toBe(
        "Numero do documento informado não é um CPF válido."
      );
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
      expect(result.value.message).toBe(
        "Numero do documento informado não é um CNPJ válido."
      );
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
      expect(result.value.message).toBe(
        "Numero do documento informado não é um CNH válido."
      );
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
      new UniqueEntityId()
    );
    inMemoryUsersRepository.items.push(user);

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
    expect(inMemoryUsersRepository.items.length).toEqual(1);
    expect(inMemoryTenantsRepository.items.length).toEqual(1);
    expect(inMemoryMembershipsRepository.items.length).toEqual(1);
    expect(inMemoryUsersRepository.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ nickName: firstName })])
    );
  });
});
