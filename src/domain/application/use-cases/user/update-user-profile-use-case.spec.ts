import { faker } from "@faker-js/faker";
import { NotFoundError } from "src/core/errors/not-found-error.js";
import { createTestContext } from "test/@context/context-test.js";
import { makeUser } from "test/factories/make-user.js";
import { UpdateUserProfileUseCase } from "./update-user-profile-use-case.js";

let ctx: ReturnType<typeof createTestContext>;
let sut: UpdateUserProfileUseCase;

describe("Select Account Use Case", () => {
  beforeEach(() => {
    ctx = createTestContext();
    sut = new UpdateUserProfileUseCase(ctx.usersRepository, ctx.fakerUploader);
  });

  test("Deve ser possível atualizar o perfil do usuário com sucesso (sem avatar)", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      firstName: "Novo",
      lastName: "Nome",
      nickName: "novo.nick",
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = ctx.usersRepository.items.find((u) => u.id === user.id);
    expect(updatedUser?.firstName).toBe("Novo");
    expect(updatedUser?.lastName).toBe("Nome");
    expect(updatedUser?.nickName).toBe("novo.nick");
  });

  test("Deve ser possível atualizar o avatar do usuário", async () => {
    const user = makeUser();
    ctx.usersRepository.items.push(user);

    const fakeBuffer = Buffer.from("fake image");
    const avatar = {
      fileName: "avatar.jpg",
      fileSize: 12345,
      mimeType: "image/jpeg",
      buffer: fakeBuffer,
    };

    const result = await sut.execute({
      userId: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      avatar,
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = ctx.usersRepository.items.find((u) => u.id === user.id);
    expect(updatedUser?.avatarUrl).toBe(`/uploads/avatars/${user.id}`);
    expect(ctx.fakerUploader.uploaded.length).toBe(1);
  });

  test("Não deve ser possível permitir atualização de usuário inexistente", async () => {
    const result = await sut.execute({
      userId: faker.string.uuid(),
      firstName: "Fake",
      lastName: "User",
      nickName: "fakeuser",
    });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toBe("Usuário não encontrado.");
    }
  });
});
