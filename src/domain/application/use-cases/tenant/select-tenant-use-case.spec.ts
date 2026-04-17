import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeTenant } from "test/factories/make-tenant.js";
import { makeUser } from "test/factories/make-user.js";
import { SelectTenantUseCase } from "./select-tenant-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: SelectTenantUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new SelectTenantUseCase(
      ctx.usersRepository,
      ctx.membershipsRepository,
      ctx.tenantsRepository,
    );
  });

  test("Deve ser possível alterar o tenant do usuário", async () => {
    const tenant1 = makeTenant();
    ctx.tenantsRepository.items.push(tenant1);
    const tenant2 = makeTenant();
    ctx.tenantsRepository.items.push(tenant2);

    const user = makeUser();
    ctx.usersRepository.items.push(user);

    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant1.id.toString(),
        userId: user.id.toString(),
      }),
    );
    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant2.id.toString(),
        userId: user.id.toString(),
        owner: false,
        role: "user",
      }),
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
        }),
      );
      const lastAccess = ctx.membershipsRepository.items.find(
        (i) => i.tenantId === tenant2.id.toString(),
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
    ctx.usersRepository.items.push(user);

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

  test("Não deve ser possível alterar o tenant de um usuário para um tenant inativado", async () => {
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

  test("Não deve ser possível alterar o tenant de um usuário que não pertence a nenhum tenant", async () => {
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);

    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não pertence a nenhuma organização.");
    }
  });

  test("Não deve ser possível alterar o tenant de um usuário que não pertence ao tenant", async () => {
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);
    const tenant2 = makeTenant();
    ctx.tenantsRepository.items.push(tenant2);

    const user = makeUser();
    ctx.usersRepository.items.push(user);

    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
      }),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant2.id.toString(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Usuário não pertence à organização selecionada.");
    }
  });
});
