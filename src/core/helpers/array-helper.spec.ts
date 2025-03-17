import { ArrayHelper } from "./array-helper";

describe("Array Helper", () => {
  test("Verifica campos duplicados", () => {
    const arrayDeObjetosDiferente = [
      { campo: "valor1", valor: "10" },
      { campo: "valor2", valor: "11" },
      { campo: "valor3", valor: "12" },
      { campo: "valor4", valor: "10" },
    ];
    const temDuplicatasCampo = ArrayHelper.verificarDuplicatas(
      arrayDeObjetosDiferente,
      "campo"
    );

    const temDuplicatasValor = ArrayHelper.verificarDuplicatas(
      arrayDeObjetosDiferente,
      "valor"
    );

    expect(temDuplicatasCampo).toBe(false);
    expect(temDuplicatasValor).toBe(true);
  });

  test("Operações de queru builder no array", () => {
    const pessoas = [
      { nome: "João", idade: 25, cidade: "São Paulo" },
      { nome: "Joana", idade: 20, cidade: "Rio de Janeiro" },
      { nome: "Carlos", idade: 30, cidade: "São Paulo" },
      { nome: "Maria", idade: 22, cidade: "Belo Horizonte" },
      { nome: "Bruno", idade: 19, cidade: "Curitiba" },
      { nome: "Sabrina", idade: 30, cidade: "São Paulo" },
    ];

    ArrayHelper.query(pessoas, {
      filters: {
        idade: { gt: 20 },
        cidade: { contains: "São" },
      },
      sort: {
        sortBy: "nome",
        sortOrder: "asc",
      },
      pagination: {
        page: 1,
        limit: 2,
      },
    });

    expect(pessoas).toEqual([
      { nome: "Carlos", idade: 30, cidade: "São Paulo" },
      { nome: "João", idade: 25, cidade: "São Paulo" },
    ]);
  });
});
