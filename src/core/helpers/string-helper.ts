export class StringHelper {
  static stringToSlug(value: string) {
    const slugText = value
      .normalize("NFKD")
      .toLocaleLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/_/g, "-")
      .replace(/--+/g, "-")
      .replace(/-$/g, "");
    return slugText;
  }

  static isValidColumnName(value: string): boolean {
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return regex.test(value);
  }

  static isNullOrEmpty(value: string | undefined | null): boolean {
    return value === null || value === undefined || value.trim() === "";
  }

  static cleanSQL(sql: string): string {
    return (
      sql
        // Remove comentários de bloco /* ... */
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Remove comentários de linha -- até a quebra de linha
        .replace(/--.*?(\r?\n|$)/g, "")
        // Remove tabulações
        .replace(/\t/g, " ")
        // Remove quebras de linha
        .replace(/\r?\n/g, " ")
        // Remove espaços duplicados
        .replace(/ {2,}/g, " ")
        // Remove espaços antes de vírgulas
        .replace(/ ,/g, ",")
        // Remove espaços extras no início e no final
        .trim()
    );
  }

  static passwordRequirements(password: string): string[] | null {
    let erros: string[] = [];
    if (password.length < 8) {
      erros.push("A senha deve ter pelo menos 8 caracteres.");
    }

    if (!/[A-Z]/.test(password)) {
      erros.push("A senha deve conter pelo menos uma letra maiúscula.");
    }

    if (!/[a-z]/.test(password)) {
      erros.push("A senha deve conter pelo menos uma letra minúscula.");
    }

    if (!/\d/.test(password)) {
      erros.push("A senha deve conter pelo menos um número.");
    }

    if (!/[@$!%*?&]/.test(password)) {
      erros.push(
        "A senha deve conter pelo menos um caractere especial (@$!%*?&)."
      );
    }

    return erros.length == 0 ? null : erros; // Retorna null se a senha for válida
  }

  static generateRandomCode(tamanho: number = 8): string {
    if (tamanho <= 0) {
      throw new Error("O tamanho deve ser maior que 0.");
    }

    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Conjunto alfanumérico
    let codigo = "";

    for (let i = 0; i < tamanho; i++) {
      const randomIndex = Math.floor(Math.random() * caracteres.length);
      codigo += caracteres[randomIndex];
    }

    return codigo;
  }

  static isValidCNPJ(cnpjinformado: string): string | false {
    if (!cnpjinformado) return false;

    const exp = /\.|-|\//g;

    // Remover ".", "-", "/"
    cnpjinformado = cnpjinformado.toString().replace(exp, "");

    // Aceita receber o valor como string, número ou array com todos os dígitos
    const isString = typeof cnpjinformado === "string";
    const validTypes = isString;

    // Elimina valor de tipo inválido
    if (!validTypes) return false;

    // Filtro inicial para entradas do tipo string
    if (isString) {
      // Teste Regex para veificar se é uma string apenas dígitos válida
      const digitsOnly = /^\d{14}$/.test(cnpjinformado);
      // Verifica se o valor passou do teste
      const isValid = digitsOnly;

      // Se o formato não é válido, retorna inválido
      if (!isValid) return false;
    }

    // Elimina tudo que não é dígito
    const match = cnpjinformado.toString().match(/\d/g);
    const numbers = Array.isArray(match) ? match.map(Number) : [];

    // Valida a quantidade de dígitos
    if (numbers.length !== 14) return false;

    // Elimina inválidos com todos os dígitos iguais
    const items = [...new Set(numbers)];
    if (items.length === 1) return false;

    // Separa os 2 últimos dígitos verificadores
    const digits = numbers.slice(12);

    // Valida 1o. dígito verificador
    const digit0 = validCalc(12, numbers);
    if (digit0 !== digits[0]) return false;

    // Valida 2o. dígito verificador
    const digit1 = validCalc(13, numbers);
    return digit1 === digits[1] ? cnpjinformado : false;
  }

  static isValidCPF(cpfInformado: string): string | false {
    let i,
      add,
      rev,
      cpfValido = false;
    let exp = /\.|-/g;

    cpfInformado = cpfInformado.toString().replace(exp, "");
    cpfInformado = cpfInformado.replace(/[^\d]+/g, "");

    if (cpfInformado !== "") {
      // Elimina CPFs invalidos conhecidos

      cpfValido = !(
        cpfInformado.length != 11 ||
        cpfInformado == "00000000000" ||
        cpfInformado == "11111111111" ||
        cpfInformado == "22222222222" ||
        cpfInformado == "33333333333" ||
        cpfInformado == "44444444444" ||
        cpfInformado == "55555555555" ||
        cpfInformado == "66666666666" ||
        cpfInformado == "77777777777" ||
        cpfInformado == "88888888888" ||
        cpfInformado == "99999999999"
      );

      // Valida 1o digito
      add = 0;
      for (i = 0; i < 9; i++) {
        add += parseInt(cpfInformado.charAt(i)) * (10 - i);
      }

      rev = 11 - (add % 11);

      if (rev == 10 || rev == 11) {
        rev = 0;
      }

      cpfValido = rev != parseInt(cpfInformado.charAt(9)) ? false : cpfValido;

      // Valida 2o digito
      add = 0;

      for (i = 0; i < 10; i++) {
        {
          add += parseInt(cpfInformado.charAt(i)) * (11 - i);
        }
      }

      rev = 11 - (add % 11);

      if (rev == 10 || rev == 11) {
        rev = 0;
      }

      cpfValido = rev != parseInt(cpfInformado.charAt(10)) ? false : cpfValido;
    }

    return cpfValido ? cpfInformado : false;
  }
}

function validCalc(x: number, numbers: number[]) {
  const slice = numbers.slice(0, x);
  let factor = x - 7;
  let sum = 0;

  for (let i = x; i >= 1; i--) {
    const n = slice[x - i];
    sum += n * factor--;
    if (factor < 2) factor = 9;
  }

  const result = 11 - (sum % 11);

  return result > 9 ? 0 : result;
}
