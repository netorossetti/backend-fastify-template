import { StringHelper } from "src/core/helpers/string-helper";
import z from "zod/v4";

/**
 * Cria um schema Zod dinâmico para validação de arquivos
 */
export function zodPasswordSchema(path: string = "password") {
  return z.string().refine((password) => {
    const mensagemErro = StringHelper.passwordRequirements(password);
    if (mensagemErro && mensagemErro.length > 0) {
      throw new z.ZodError(
        mensagemErro.map((mensagem) => ({
          code: "custom",
          message: mensagem,
          path: [path],
        }))
      );
    }
    return true;
  });
}
