import { faker } from "@faker-js/faker";
import { ConflictError } from "src/core/errors/conflict-error";
import { NotAllowedError } from "src/core/errors/not-allowed-error";
import { NotFoundError } from "src/core/errors/not-found-error";
import { makeMembership } from "test/factories/make-membership";
import { makeTenant } from "test/factories/make-tenant";
import { makeUser } from "test/factories/make-user";
import { FakeHasher } from "test/lib/cryptography/fake-hasher";
import { FakerUploader } from "test/lib/faker-uploader";
import { InMemoryMembershipsRepository } from "test/repositories/in-memory-memberships-repository";
import { InMemoryTenantsRepository } from "test/repositories/in-memory-tenants-repository";
import { InMemoryUsersRepository } from "test/repositories/in-memory-users-repository";
import { CreateNewUserAccessUseCase } from "./create-new-user-access-use-case";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryTenantsRepository: InMemoryTenantsRepository;
let inMemoryMembershipsRepository: InMemoryMembershipsRepository;
let fakeHasher: FakeHasher;
let fakerUploader: FakerUploader;
let sut: CreateNewUserAccessUseCase;

describe("Create New User Access Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryTenantsRepository = new InMemoryTenantsRepository();
    inMemoryMembershipsRepository = new InMemoryMembershipsRepository();
    fakeHasher = new FakeHasher();
    fakerUploader = new FakerUploader();
    sut = new CreateNewUserAccessUseCase(
      inMemoryUsersRepository,
      inMemoryTenantsRepository,
      inMemoryMembershipsRepository,
      fakerUploader,
      fakeHasher
    );
  });

  test("Deve ser possível criar um novo acesso de usuário.", async () => {
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
    expect(inMemoryUsersRepository.items.length).toEqual(2);
    expect(inMemoryMembershipsRepository.items.length).toEqual(2);
    const newUser = inMemoryUsersRepository.items.find((u) => u.id !== user.id);
    expect(newUser?.avatarUrl).toBe(`/uploads/avatars/${user.id}`);
    expect(fakerUploader.uploaded.length).toBe(1);
  });

  test("Deve ser possível criar um novo acesso de usuário para um usuário já existente em outro organização.", async () => {
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

    const otherTenant = makeTenant();
    inMemoryTenantsRepository.items.push(otherTenant);
    const otherUser = makeUser();
    inMemoryUsersRepository.items.push(otherUser);
    inMemoryMembershipsRepository.items.push(
      makeMembership({
        userId: otherUser.id.toString(),
        tenantId: otherTenant.id.toString(),
        role: "user",
      })
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
    expect(inMemoryUsersRepository.items.length).toEqual(2);
    expect(inMemoryMembershipsRepository.items.length).toEqual(3);
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
    inMemoryUsersRepository.items.push(user);

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
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

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
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant({ active: false });
    inMemoryTenantsRepository.items.push(tenant);

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
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);

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
        "Acesso negado. Usuário sem vinculo de acesso."
      );
    }
  });

  test("Não deve ser possível criar um novo acesso com um usuário com vinculo de acesso inativado na organização", async () => {
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
        "Usuário não tem permisão necessária para criar um novo usuário."
      );
    }
  });

  test("Não deve ser possível criar um novo acesso com um usuário para um usuário que já possui acesso a organização", async () => {
    const user = makeUser();
    inMemoryUsersRepository.items.push(user);
    const tenant = makeTenant();
    inMemoryTenantsRepository.items.push(tenant);
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
        "Já existe um usuário registrado para sua organização com o mesmo email informado!"
      );
    }
  });
});
