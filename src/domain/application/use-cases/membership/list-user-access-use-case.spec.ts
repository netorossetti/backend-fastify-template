import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeTenant } from "test/factories/make-tenant.js";
import { makeUser } from "test/factories/make-user.js";
import { ListUserAccessUseCase } from "./list-user-access-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: ListUserAccessUseCase;

describe("Update User Access Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new ListUserAccessUseCase(
      ctx.usersRepository,
      ctx.tenantsRepository,
      ctx.membershipsRepository,
    );
  });

  test("Deve ser possível obter lista acessos dos usuarios.", async () => {
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    ctx.membershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
        tenantId: tenant.id.toString(),
        role: "admin",
      }),
    );

    const otherUser = makeUser();
    ctx.usersRepository.items.push(otherUser);
    ctx.membershipsRepository.items.push(
      makeMembership({
        userId: otherUser.id.toString(),
        tenantId: tenant.id.toString(),
        role: "user",
      }),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.users.length).toEqual(2);
    }
  });

  test("Não deve ser possível obter lista acessos dos usuarios com um usuário inválido", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não encontrado.");
    }
  });

  test("Não deve ser possível obter lista acessos dos usuarios com uma organização inválida", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: faker.string.uuid(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização não encontrada.");
    }
  });

  test("Não deve ser possível obter lista acessos dos usuarios com uma organização inativada", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    ctx.tenantsRepository.items.push(tenant);

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

  test("Não deve ser possível obter lista acessos dos usuarios com uma organização inativada", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    ctx.tenantsRepository.items.push(tenant);

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

  test("Não deve ser possível obter lista acessos dos usuarios com um usuário sem vinculo de acesso à organização", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Acesso negado. Usuário sem vinculo de acesso.");
    }
  });

  test("Não deve ser possível obter lista acessos dos usuarios com um usuário com vinculo de acesso inativado na organização", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);
    ctx.membershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
        tenantId: tenant.id.toString(),
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
      expect(result.value.message).toBe("Acesso negado. Usuário inativado.");
    }
  });

  test("Não deve ser possível obter lista acessos dos usuarios com um usuário sem privilegio de acesso na organização", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);
    ctx.membershipsRepository.items.push(
      makeMembership({
        userId: user.id.toString(),
        tenantId: tenant.id.toString(),
        role: "user",
      }),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Usuário não tem permisão necessária para listar usuários.",
      );
    }
  });
});
