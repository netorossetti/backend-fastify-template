import fs from "node:fs";
import path from "node:path";
import z from "zod/v4";

export function zodIsFolderSchema(param?: {
  message?: string;
  allowRelativePath?: boolean;
}) {
  return z.string().refine(
    (folderPath) => {
      try {
        // Verifica se o caminho é relativo e se isso é permitido
        if (!param?.allowRelativePath && !path.isAbsolute(folderPath)) {
          return false;
        }

        const resolvePath = path.resolve(folderPath);
        return (
          fs.existsSync(resolvePath) && fs.statSync(resolvePath).isDirectory()
        );
      } catch (error) {
        return false;
      }
    },
    {
      message:
        param?.message ?? "O caminho informado não é um diretório válido.",
    }
  );
}
