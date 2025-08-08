import { StringHelper } from "./string-helper";

describe("String Helper", () => {
  test("String to slug", () => {
    const slug = StringHelper.stringToSlug("Teste de Criação de Slug");
    expect(slug).toEqual("teste-de-criacao-de-slug");
  });

  test("Is a Valid Column Name", () => {
    expect(StringHelper.isValidColumnName("nome_da_coluna")).toBe(true);
    expect(StringHelper.isValidColumnName("123_coluna")).toBe(false);
    expect(StringHelper.isValidColumnName("coluna@invalida")).toBe(false);
  });

  test("Truncate", () => {
    expect(StringHelper.truncate("Olá mundo", 5)).toEqual("Olá m");
    expect(StringHelper.truncate("Olá mundo", 255)).toEqual("Olá mundo");
  });

  test("Clean SQL", () => {
    const sql = /**sql */ `
          SELECT A
               , B
               , C as "ceTaDoido"
            FROM tabela --tabela de teste
            JOIN tabela2 /** comentario */ as tab2
              ON tabela.id = tab2.idTabela --comentario`;

    const result = StringHelper.cleanSQL(sql);
    expect(result).toEqual(
      'SELECT A, B, C as "ceTaDoido" FROM tabela JOIN tabela2 as tab2 ON tabela.id = tab2.idTabela'
    );
  });

  test("is null or empty", () => {
    expect(StringHelper.isNullOrEmpty(null)).toBe(true);
    expect(StringHelper.isNullOrEmpty("")).toBe(true);
    expect(StringHelper.isNullOrEmpty("not-null")).toBe(false);
  });

  test("Verify password requirements", () => {
    let result: string[] | null = null;
    result = StringHelper.passwordRequirements("123");
    expect(result).toEqual(
      expect.arrayContaining(["A senha deve ter pelo menos 8 caracteres."])
    );

    result = StringHelper.passwordRequirements("1234567890");
    expect(result).toEqual(
      expect.arrayContaining([
        "A senha deve conter pelo menos uma letra maiúscula.",
      ])
    );

    result = StringHelper.passwordRequirements("A234567890");
    expect(result).toEqual(
      expect.arrayContaining([
        "A senha deve conter pelo menos uma letra minúscula.",
      ])
    );

    result = StringHelper.passwordRequirements("Abcdefghi");
    expect(result).toEqual(
      expect.arrayContaining(["A senha deve conter pelo menos um número."])
    );

    result = StringHelper.passwordRequirements("Ab34567890");
    expect(result).toEqual(
      expect.arrayContaining([
        "A senha deve conter pelo menos um caractere especial (@$!%*?&).",
      ])
    );

    result = StringHelper.passwordRequirements("Ab@4567890");
    expect(result).toBe(null);
  });

  test("Generate random code", () => {
    let result: string | null = null;
    result = StringHelper.generateRandomCode();
    expect(typeof result).toBe("string");
    expect(result.length).toEqual(8);

    result = StringHelper.generateRandomCode(12);
    expect(typeof result).toBe("string");
    expect(result.length).toEqual(12);

    expect(async () => {
      StringHelper.generateRandomCode(0);
    }).rejects.toBeInstanceOf(Error);
  });

  test("Only numbers", () => {
    const result = StringHelper.onlyNumbers("02.582.568/0001-75");
    expect(result).toBe("02582568000175");
  });

  test("Is HTML", () => {
    expect(StringHelper.isHTML("<p>Texto HTML</p>")).toBe(true);
    expect(StringHelper.isHTML("Texto comum")).toBe(false);
  });
});
