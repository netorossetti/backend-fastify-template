import { Slug } from "./slug";

test("deve ser possivel criar um slug de um texto", () => {
  const slug = Slug.createFromText("Teste de criação de uma slug.");

  expect(slug.value).toEqual("teste-de-criacao-de-uma-slug");
});
