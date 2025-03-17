import { UniqueEntityId } from "./unique-entity-id";

const regexUUIDv4 =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

test("deve ser possivel criar uuid", () => {
  const uuid = new UniqueEntityId();
  expect(uuid.toValue()).toMatch(regexUUIDv4);
});

test("deve ser possivel instanciar uuid", () => {
  const uuid = new UniqueEntityId("86b4412e-3d3a-4785-97fa-d3545db7e79e");
  expect(uuid.toValue()).toEqual("86b4412e-3d3a-4785-97fa-d3545db7e79e");
});

test("não deve ser possivel instanciar uuid inválido", () => {
  expect(() => {
    new UniqueEntityId("teste");
  }).toThrowError("Invalid UUID value.");
});
