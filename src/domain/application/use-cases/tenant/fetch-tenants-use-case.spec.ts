import { faker } from "@faker-js/faker";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeMembership } from "test/factories/make-membership";
import { makeTenant } from "test/factories/make-tenant";
import { makeUser } from "test/factories/make-user";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { FetchTenantsUseCase } from "./fetch-tenants-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let sut: FetchTenantsUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    inMemoryTenantsRepository.setMembershipsRepository(
      inMemoryMembershipsRepository
    );
    sut = new FetchTenantsUseCase(
      inMemoryUsersRepository,
      inMemoryTenantsRepository
    );
  });

  test("Deve ser possível listar tenants do usuário", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);

    const tenant1 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant1);
    const tenant2 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant2);
    const tenant3 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant3);
    const tenant4 = makeTenant();
    inMemoryTenantsRepository.items.push(tenant4);

    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant1.id.toString(),
        userId: user.id.toString(),
        owner: true,
        role: "admin",
      })
    );
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant2.id.toString(),
        userId: user.id.toString(),
        owner: true,
        role: "admin",
      })
    );
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant3.id.toString(),
        userId: user.id.toString(),
        owner: false,
        role: "admin",
      })
    );
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        tenantId: tenant3.id.toString(),
        userId: user.id.toString(),
        owner: false,
        role: "user",
      })
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
