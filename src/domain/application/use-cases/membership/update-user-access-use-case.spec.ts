import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeMembership } from "test/factories/make-membership";
import { makeTenant } from "test/factories/make-tenant";
import { makeUser } from "test/factories/make-user";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { UpdateUserAccessUseCase } from "./update-user-access-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let sut: UpdateUserAccessUseCase;

describe("Update User Access Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    sut = new UpdateUserAccessUseCase(
      inMemoryUsersRepository,
      inMemoryTenantsRepository,
      inMemoryMembershipsRepository
    );
  });

  test("Deve ser possível altera o acesso de um usuário de usuário.", async () => {
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
        tenantId: tenant.id.toString(),
        role: "admin",
      })
    );

    const otherUser = makeUser();
    inMemoryUsersRepository.items.push(otherUser);
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        userId: otherUser.id.toString(),
        tenantId: tenant.id.toString(),
        role: "user",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      updateUser: {
        userId: otherUser.id.toString(),
        active: false,
        role: "user",
      },
    });

    expect(result.isSuccess()).toBe(true);
    expect(inMemoryUsersRepository.items.length).toEqual(2);
    expect(inMemoryMembershipsRepository.items.length).toEqual(2);
    expect(
      inMemoryMembershipsRepository.items.filter((i) => !i.active).length
    ).toEqual(1);
  });

  test("Não deve ser possível altera o acesso de um usuário com um usuário inválido", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não encontrado.");
    }
  });

  test("Não deve ser possível altera o acesso de um usuário com uma organização inválida", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: faker.string.uuid(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização não encontrada.");
    }
  });

  test("Não deve ser possível altera o acesso de um usuário com uma organização inativada", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização inativa.");
    }
  });

  test("Não deve ser possível altera o acesso de um usuário com uma organização inativada", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização inativa.");
    }
  });

  test("Não deve ser possível altera o acesso de um usuário com um usuário sem vinculo de acesso à organização", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Acesso negado. Usuário sem vinculo de acesso."
      );
    }
  });

  test("Não deve ser possível altera o acesso de um usuário com um usuário com vinculo de acesso inativado na organização", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
        tenantId: tenant.id.toString(),
        active: false,
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Acesso negado. Usuário inativado.");
    }
  });

  test("Não deve ser possível altera o acesso de um usuário com um usuário sem privilegio de acesso na organização", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
        tenantId: tenant.id.toString(),
        role: "user",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Usuário não tem permisão necessária para atualiza acesso de um usuário."
      );
    }
  });

  test("Não deve ser possível altera o acesso de um usuário sem acesso definido para a organização", async () => {
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
        tenantId: tenant.id.toString(),
        role: "admin",
      })
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      updateUser: {
        userId: faker.string.uuid(),
        active: true,
        role: "user",
      },
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Permisão de acesso não localizada.");
    }
  });
});
