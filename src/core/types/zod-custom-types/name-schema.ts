import { faker } from "@faker-js/faker";
import z from "zod/v4";

export function zodNameSchema(params?: {
  description?: string;
  minSize?: number;
  maxSize?: number;
  allowHyphens?: boolean;
  allowApostrophes?: boolean;
  allowNumbers?: boolean;
}) {
  const description = params?.description ?? "Nome";
  const minSize = params?.minSize ?? 2;
  const maxSize = params?.maxSize ?? 80;
  const allowHyphens = params?.allowHyphens ?? false;
  const allowApostrophes = params?.allowApostrophes ?? false;
  const allowNumbers = params?.allowNumbers ?? false;

  // Construir classe de caracteres permitidos
  let charClass = "A-Za-zÀ-ÖØ-öø-ÿ";

  if (allowApostrophes) {
    // adiciona os dois tipos de apóstrofos simples e tipográficos
    charClass += "'’";
  }

  if (allowNumbers) {
    charClass += "0-9";
  }

  // montar regex dinâmica para as palavras
  // padrão base para uma palavra (com possíveis hífens e apóstrofos dentro dela)
  // se permitir hífen, inclui - no grupo, caso contrário não
  const hyphenPart = allowHyphens ? `(-[${charClass}]+)*` : "";

  // A regex vai permitir múltiplas palavras separadas por um ou mais espaços
  // permitimos espaços no início e no fim
  const regexString = `^\\s*([${charClass}]+${hyphenPart})(\\s+([${charClass}]+${hyphenPart}))*\\s*$`;
  const regex = new RegExp(regexString);

  return z
    .string()
    .min(
      minSize,
      `O ${description.toLocaleLowerCase()} deve ter pelo menos ${minSize} caracteres`
    )
    .max(
      maxSize,
      `O ${description.toLocaleLowerCase()} deve ter no máximo ${maxSize} caracteres`
    )
    .regex(regex, `${description} inválido`)
    .describe(description)
    .meta({ example: faker.person.firstName() });
}
