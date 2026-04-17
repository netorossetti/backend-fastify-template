import { faker } from "@faker-js/faker";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeTenant } from "test/factories/make-tenant.js";
import { makeUser } from "test/factories/make-user.js";
import { FetchTenantsUseCase } from "./fetch-tenants-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: FetchTenantsUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new FetchTenantsUseCase(ctx.usersRepository, ctx.tenantsRepository);
  });

  test("Deve ser possível listar tenants do usuário", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const tenant1 = makeTenant();
    ctx.tenantsRepository.items.push(tenant1);
    const tenant2 = makeTenant();
    ctx.tenantsRepository.items.push(tenant2);
    const tenant3 = makeTenant();
    ctx.tenantsRepository.items.push(tenant3);
    const tenant4 = makeTenant();
    ctx.tenantsRepository.items.push(tenant4);

    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant1.id.toString(),
        userId: user.id.toString(),
        owner: true,
        role: "admin",
      }),
    );
    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant2.id.toString(),
        userId: user.id.toString(),
        owner: true,
        role: "admin",
      }),
    );
    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant3.id.toString(),
        userId: user.id.toString(),
        owner: false,
        role: "admin",
      }),
    );
    ctx.membershipsRepository.items.push(
      makeMembership({
        tenantId: tenant3.id.toString(),
        userId: user.id.toString(),
        owner: false,
        role: "user",
      }),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
    });
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.tenants.length).toEqual(3);
    }
  });

  test("Não deve ser possível listar tenants de um usuário inválido", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não localizado.");
    }
  });
});
