import { faker } from "@faker-js/faker";
import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeTenant } from "test/factories/make-tenant.js";
import { makeUser } from "test/factories/make-user.js";
import { ReactivateTenantUseCase } from "./reactivate-tenant-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: ReactivateTenantUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new ReactivateTenantUseCase(
      ctx.usersRepository,
      ctx.tenantsRepository,
      ctx.membershipsRepository,
    );
  });

  test("Deve ser possível reativar um tenant", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const otherUser1 = makeUser();
    ctx.usersRepository.items.push(otherUser1);
    const otherUser2 = makeUser();
    ctx.usersRepository.items.push(otherUser2);

    const tenant = makeTenant({ active: false });
    ctx.tenantsRepository.items.push(tenant);

    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        owner: true,
        active: false,
      }),
    );

    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: otherUser1.id.toString(),
        role: "user",
        active: false,
      }),
    );

    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: otherUser2.id.toString(),
        role: "user",
        active: false,
      }),
    );
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.tenant.active).toBe(true);
      const membershipInactive = ctx.membershipsRepository.items.filter((i) => i.active);
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
    ctx.tenantsRepository.items.push(tenant);

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
    ctx.tenantsRepository.items.push(tenant);

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
    ctx.tenantsRepository.items.push(tenant);

    const user = makeUser();
    ctx.usersRepository.items.push(user);

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
    ctx.tenantsRepository.items.push(tenant);

    const user = makeUser();
    ctx.usersRepository.items.push(user);

    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant.id.toString(),
        userId: user.id.toString(),
        role: "admin",
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
        "Usuário não tem permisão necessária para alterar dados da organização.",
      );
    }
  });
});
