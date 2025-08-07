import { faker } from "@faker-js/faker";
import z from "zod/v4";

export function zodNameSchema(description: string = "Primeiro nome") {
  return z
    .string()
    .min(
      2,
      `O ${description.toLocaleLowerCase()} deve ter pelo menos 3 caracteres`
    )
    .max(
      50,
      `O ${description.toLocaleLowerCase()} deve ter no máximo 50 caracteres`
    )
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿ']+(?: [A-Za-zÀ-ÖØ-öø-ÿ']+)*$/,
      `${description} inválido`
    )
    .describe(description)
    .meta({ example: faker.person.firstName() });
}
