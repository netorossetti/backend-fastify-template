import { faker } from "@faker-js/faker";
import { BadRequestError } from "src/core/errors/bad-request-error";
import { ConflictError } from "src/core/errors/conflict-error";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeMembership } from "test/factories/make-membership";
import { makeTenant } from "test/factories/make-tenant";
import { makeUser } from "test/factories/make-user";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { fake } from "validation-br/dist/cnpj";
import { UpdateTenantUseCase } from "./update-tenant-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let sut: UpdateTenantUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();

    sut = new UpdateTenantUseCase(
      inMemoryUsersRepository,
      inMemoryTenantsRepository,
      inMemoryMembershipsRepository
    );
  });

  test("Deve ser possível atualizar um tenant", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        role: "admin",
      })
    );

    const novoCnpj = fake({ alphanumeric: false, withMask: false });
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CNPJ",
      documentNumber: novoCnpj,
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.tenant).toEqual(
        expect.objectContaining({
          name: "Novo nome",
          nickName: "apelido",
          documentType: "CNPJ",
          documentNumber: novoCnpj,
        })
      );
    }
  });

  test("Não deve ser possível atualizar um tenant de um usuário inválido", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CPF",
      documentNumber: fake(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não localizado.");
    }
  });

  test("Não deve ser possível atualizar um tenant inválido", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: faker.string.uuid(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CPF",
      documentNumber: fake(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização não localizada.");
    }
  });

  test("Não deve ser possível atualizar um tenant inátivado", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CPF",
      documentNumber: fake(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização inativa.");
    }
  });

  test("Não deve ser possível atualizar um tenant com um usuário não percente ao tenant", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CPF",
      documentNumber: fake(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Usuário não pertence a organização.");
    }
  });

  test("Não deve ser possível atualizar um tenant com um usuário com permisão inativada", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        active: false,
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CPF",
      documentNumber: fake(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Permissão de acesso inativada.");
    }
  });

  test("Não deve ser possível atualizar um tenant com um documento de outro tenant existente", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    const tenant2 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant2);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        role: "admin",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: tenant2.documentType,
      documentNumber: tenant2.documentNumber,
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(ConflictError);
      expect(result.value.message).toBe(
        "Organização já foi registrada com o documento informado."
      );
    }
  });

  test("Não deve ser possível atualizar um tenant com CPF inválido.", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        role: "admin",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CPF",
      documentNumber: "12345648915",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe(
        "Numero do documento informado não é um CPF válido."
      );
    }
  });

  test("Não deve ser possível atualizar um tenant com CNPJ inválido.", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        role: "admin",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CNPJ",
      documentNumber: "12345648915",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe(
        "Numero do documento informado não é um CNPJ válido."
      );
    }
  });

  test("Não deve ser possível atualizar um tenant com CNH inválido.", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        role: "admin",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      name: "Novo nome",
      nickName: "apelido",
      documentType: "CNH",
      documentNumber: "12345648915",
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(BadRequestError);
      expect(result.value.message).toBe(
        "Numero do documento informado não é um CNH válido."
      );
    }
  });
});
