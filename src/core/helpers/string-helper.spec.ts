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

  test("Validate CNPJ with formatting", () => {
    const result = StringHelper.isValidCNPJ("20.582.568/0001-75");
    expect(result).toBe("20582568000175");
  });

  test("Validate CNPJ without formatting", () => {
    const result = StringHelper.isValidCNPJ("20582568000175");
    expect(result).toBe("20582568000175");
  });

  test("Validate CNPJ repeated numbers", () => {
    const result = StringHelper.isValidCNPJ("00000000000000");
    expect(result).toBe(false);
  });

  test("Validate invalid CNPJ", () => {
    const result = StringHelper.isValidCNPJ("12345678901234");
    expect(result).toBe(false);
  });

  test("Validate CPF with formatting", () => {
    const result = StringHelper.isValidCPF("610.594.580-98");
    expect(result).toBe("61059458098");
  });

  test("Validate CPF without formatting", () => {
    const result = StringHelper.isValidCPF("61059458098");
    expect(result).toBe("61059458098");
  });

  test("Validate CPF repeated numbers", () => {
    const result = StringHelper.isValidCPF("00000000000");
    expect(result).toBe(false);
  });

  test("Validate invalid CPF", () => {
    const result = StringHelper.isValidCPF("12345678901");
    expect(result).toBe(false);
  });
});
