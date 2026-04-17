import { faker } from "@faker-js/faker";
import { ConflictError } from "src/core/errors/conflict-error.js";
import { NotAllowedError } from "src/core/errors/not-allowed-error.js";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeMembership } from "test/factories/make-membership.js";
import { makeTenant } from "test/factories/make-tenant.js";
import { makeUser } from "test/factories/make-user.js";
import { CreateNewUserAccessUseCase } from "./create-new-user-access-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: CreateNewUserAccessUseCase;

describe("Create New User Access Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new CreateNewUserAccessUseCase(
      ctx.usersRepository,
      ctx.tenantsRepository,
      ctx.membershipsRepository,
      ctx.fakerUploader,
      ctx.fakerHasher,
    );
  });

  test("Deve ser possível criar um novo acesso de usuário.", async () => {
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

    const firstName = faker.person.firstName();
    const fakeBuffer = Buffer.from("fake image");
    const avatar = {
      fileName: "avatar.jpg",
      fileSize: 12345,
      mimeType: "image/jpeg",
      buffer: fakeBuffer,
    };
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        nickName: firstName,
        role: "user",
        avatar: avatar,
      },
    });

    expect(result.isSuccess()).toBe(true);
    expect(ctx.usersRepository.items.length).toEqual(2);
    expect(ctx.membershipsRepository.items.length).toEqual(2);
    const newUser = ctx.usersRepository.items.find((u) => u.id !== user.id);
    expect(newUser?.avatarUrl).toBe(`/uploads/avatars/${user.id}`);
    expect(ctx.fakerUploader.uploaded.length).toBe(1);
  });

  test("Deve ser possível criar um novo acesso de usuário para um usuário já existente em outro organização.", async () => {
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

    const otherTenant = makeTenant();
    ctx.tenantsRepository.items.push(otherTenant);
    const otherUser = makeUser();
    ctx.usersRepository.items.push(otherUser);
    ctx.membershipsRepository.items.push(
      makeMembership({
        userId: otherUser.id.toString(),
        tenantId: otherTenant.id.toString(),
        role: "user",
      }),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: otherUser.email,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        nickName: otherUser.nickName,
        role: "user",
      },
    });

    expect(result.isSuccess()).toBe(true);
    expect(ctx.usersRepository.items.length).toEqual(2);
    expect(ctx.membershipsRepository.items.length).toEqual(3);
  });

  test("Não deve ser possível criar um novo acesso com um usuário inválido", async () => {
    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: faker.string.uuid(),
      tenantId: faker.string.uuid(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não encontrado.");
    }
  });

  test("Não deve ser possível criar um novo acesso com uma organização inválida", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: faker.string.uuid(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização não encontrada.");
    }
  });

  test("Não deve ser possível criar um novo acesso com uma organização inativada", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    ctx.tenantsRepository.items.push(tenant);

    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização inativa.");
    }
  });

  test("Não deve ser possível criar um novo acesso com uma organização inativada", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    ctx.tenantsRepository.items.push(tenant);

    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Organização inativa.");
    }
  });

  test("Não deve ser possível criar um novo acesso com um usuário sem vinculo de acesso à organização", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);

    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Acesso negado. Usuário sem vinculo de acesso.");
    }
  });

  test("Não deve ser possível criar um novo acesso com um usuário com vinculo de acesso inativado na organização", async () => {
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

    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Acesso negado. Usuário inativado.");
    }
  });

  test("Não deve ser possível criar um novo acesso com um usuário sem privilegio de acesso na organização", async () => {
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

    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: faker.internet.email({ firstName: firstName }),
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Usuário não tem permisão necessária para criar um novo usuário.",
      );
    }
  });

  test("Não deve ser possível criar um novo acesso com um usuário para um usuário que já possui acesso a organização", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);
    const tenant = makeTenant();
    ctx.tenantsRepository.items.push(tenant);
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

    const firstName = faker.person.firstName();
    const result = await sut.execute({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      createUser: {
        email: otherUser.email,
        firstName: firstName,
        lastName: faker.person.lastName(),
        role: "user",
      },
    });
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(ConflictError);
      expect(result.value.message).toBe(
        "Já existe um usuário registrado para sua organização com o mesmo email informado!",
      );
    }
  });
});
