import fs from "node:fs";
import path from "node:path";
import z from "zod/v4";

export function zodIsFolderSchema(param?: {
  message?: string;
  allowRelativePath?: boolean;
}) {
  const permiteRelativo = param?.allowRelativePath ?? true;

  return z.string().superRefine((folderPath, ctx) => {
    try {
      const resolvePath = path.resolve(folderPath);
      if (
        !fs.existsSync(resolvePath) ||
        !fs.statSync(resolvePath).isDirectory()
      ) {
        ctx.addIssue({
          code: "custom",
          message: param?.message ?? "O diretório informado não é válido.",
        });
        return;
      }

      // Se não permitir caminho relativo e o informado não for absoluto
      if (!permiteRelativo && !path.isAbsolute(folderPath)) {
        ctx.addIssue({
          code: "custom",
          message: "O diretório deve ser absoluto.",
        });
        return; // já adicionou erro, não precisa continuar
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: param?.message ?? "O diretório informado não é válido.",
      });
    }
  });
}
