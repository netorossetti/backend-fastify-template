import { Parser } from "htmlparser2";
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

  static onlyNumbers(value: string) {
    var numsStr = value.replace(/[^0-9]/g, "");
    return numsStr;
  }

  static isHTML(value: string): boolean {
    try {
      let isValid = false;

      const parser = new Parser({
        onopentag: () => {
          isValid = true; // Se encontrar uma tag, já é considerado HTML
        },
      });

      parser.write(value);
      parser.end();

      return isValid;
    } catch {
      return false;
    }
  }
}
