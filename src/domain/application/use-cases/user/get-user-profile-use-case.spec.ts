import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeTenant } from "test/factories/make-tenant.js";
import { makeUser } from "test/factories/make-user.js";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository.js";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository.js";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository.js";
import { GetUserProfileUseCase } from "./get-user-profile-use-case.js";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let sut: GetUserProfileUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    sut = new GetUserProfileUseCase(
      inMemoryUsersRepository,
      inMemoryMembershipsRepository,
      inMemoryTenantsRepository,
    );
  });

  test("Deve ser possível recuperar o perfil do usuário", async () => {
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
      }),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value).toEqual(
        expect.objectContaining({
          user: expect.objectContaining({ id: user.id }),
        }),
      );
    }
  });

  test("Não deve ser possível recuperar o perfil de um usuário inválido", async () => {
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

  test("Não deve ser possível recuperar o perfil de um usuário para um tenant não localizado", async () => {
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

  test("Não deve ser possível recuperar o perfil de um usuário para um tenant inátivado", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização inativa.");
    }
  });

  test("Não deve ser possível recuperar o perfil de um usuário sem permisão para o tenant", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Permisão de acesso não localizada.");
    }
  });

  test("Não deve ser possível recuperar o perfil de um usuário com permisão de acesso inativada para o tenant", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        active: false,
      }),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Permisão de acesso inativada.");
    }
  });
});
