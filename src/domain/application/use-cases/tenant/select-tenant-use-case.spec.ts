import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeMembership } from "test/factories/make-membership";
import { makeTenant } from "test/factories/make-tenant";
import { makeUser } from "test/factories/make-user";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { SelectTenantUseCase } from "./select-tenant-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let sut: SelectTenantUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    sut = new SelectTenantUseCase(
      inMemoryUsersRepository,
      inMemoryMembershipsRepository,
      inMemoryTenantsRepository
    );
  });

  test("Deve ser possível alterar o tenant do usuário", async () => {
    const tenant1 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant1);
    const tenant2 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant2);

    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant1.id.toString(),
        userId: user.id.toString(),
      })
    );
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant2.id.toString(),
        userId: user.id.toString(),
        owner: false,
        role: "user",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant2.id.toString(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            id: user.id.toString(),
            name: user.fullName,
            email: user.email,
            tenantId: tenant2.id.toString(),
            role: "user",
          }),
          tenants: expect.arrayContaining([
            expect.objectContaining({
              id: tenant1.id.toString(),
              name: tenant1.name,
            }),
            expect.objectContaining({
              id: tenant2.id.toString(),
              name: tenant2.name,
            }),
          ]),
        })
      );
      const lastAccess = inMemoryMembershipsRepository.items.find(
        (i) => i.tenantId === tenant2.id.toString()
      );
      expect(lastAccess?.lastAccessAt).instanceOf(Date);
    }
  });

  test("Não deve ser possível alterar o tenant de um usuário inválido", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não localizado.");
    }
  });

  test("Não deve ser possível alterar o tenant de um usuário para um tenant inválido", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: faker.string.uuid(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização não localizada.");
    }
  });

  test("Não deve ser possível alterar o tenant de um usuário que não pertence a nenhum tenant", async () => {
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe(
        "Usuário não pertence a nenhuma organização."
      );
    }
  });

  test("Não deve ser possível alterar o tenant de um usuário que não pertence ao tenant", async () => {
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);
    const tenant2 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant2);

    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant2.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Usuário não pertence à organização selecionada."
      );
    }
  });
});
