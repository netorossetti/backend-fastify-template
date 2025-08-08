import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeMembership } from "test/factories/make-membership";
import { makeTenant } from "test/factories/make-tenant";
import { makeUser } from "test/factories/make-user";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { ReactivateTenantUseCase } from "./reactivate-tenant-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let sut: ReactivateTenantUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();

    sut = new ReactivateTenantUseCase(
      inMemoryUsersRepository,
      inMemoryTenantsRepository,
      inMemoryMembershipsRepository
    );
  });

  test("Deve ser possível reativar um tenant", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const otherUser1 = makeUser();
    inMemoryUsersRepository.items.push(otherUser1);
    const otherUser2 = makeUser();
    inMemoryUsersRepository.items.push(otherUser2);

    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        active: false,
      })
    );

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: otherUser1.id.toString(),
        owner: false,
        role: "user",
        active: false,
      })
    );

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: otherUser2.id.toString(),
        owner: false,
        role: "user",
        active: false,
      })
    );
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.tenant.active).toBe(true);
      const membershipInactive = inMemoryMembershipsRepository.items.filter(
        (i) => i.active
      );
      expect(membershipInactive.length).toEqual(1);
    }
  });

  test("Não deve ser possível reativar um tenant inválido", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização não localizada.");
    }
  });

  test("Não deve ser possível reativar um tenant já inativado", async () => {
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização já esta ativa.");
    }
  });

  test("Não deve ser possível reativar um tenant com um usuário inválido.", async () => {
    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não localizado.");
    }
  });

  test("Não deve ser possível reativar um tenant com um usuário não pertencente a organização.", async () => {
    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Usuário não pertence a organização.");
    }
  });

  test("Não deve ser possível reativar um tenant com um usuário sem privilégio de acesso necessário.", async () => {
    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        owner: false,
        role: "admin",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Usuário não tem permisão necessária para alterar dados da organização."
      );
    }
  });
});
