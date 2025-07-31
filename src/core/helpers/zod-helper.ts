import { z, ZodTypeAny } from "zod/v4";
import { JsonObjectSchema } from "../types/json-object-schema/json-object-schema";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const jsonZodSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonZodSchema),
    z.record(z.string(), jsonZodSchema),
  ])
);

interface paramsCreateZodJsonObjectSchemaObject {
  jsonObjectSchemas: JsonObjectSchema[];
  toArray?: boolean;
}

export class ZodHelper {
  static createZodJsonObjectSchemaObject({
    jsonObjectSchemas,
    toArray,
  }: paramsCreateZodJsonObjectSchemaObject): ZodTypeAny {
    // Crie um objeto com propriedades dinâmicas usando .shape()
    const dinamicZodSchema = z.object(
      Object.fromEntries(
        jsonObjectSchemas.map((schema) => {
          const limiteSuperior = 10 ** schema.length - 1;
          const limiteInferior = -limiteSuperior;

          let zobejct;
          switch (schema.type) {
            case "TEXT":
              zobejct = z.coerce.string();
              // schema.length(-1) -> significa texto sem limite de tamanho
              if (schema.length === -1) zobejct = zobejct.max(schema.length);
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "INTEGER":
              zobejct = z.coerce
                .number()
                .int()
                .max(limiteSuperior)
                .min(limiteInferior);
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "DECIMAL":
              zobejct = z.coerce
                .number()
                .max(limiteSuperior)
                .min(limiteInferior)
                .refine(
                  (value) => {
                    const partes = value.toString().split(".");

                    if (partes.length === 1) {
                      return true;
                    }

                    return partes[1].length <= schema.precision;
                  },
                  {
                    message: `Deve ser um número decimal com no máximo ${schema.precision} dígitos decimais.`,
                  }
                );
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "MONEY":
              zobejct = z.coerce
                .string()
                .refine(
                  (value) => /^R\$\d{1,3}(\.\d{3})*(,\d{2})?$/.test(value),
                  {
                    message:
                      "Formato de dinheiro inválido. Use um formato válido (por exemplo, R$1.000,00)",
                  }
                );
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "BOOLEAN":
              zobejct = z.coerce.boolean();
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "DATETIME":
              zobejct = z.coerce.date();
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "DATE":
              zobejct = z.iso.date(
                'Invalid date format. Expect recive values in this format: "YYYY-MM-DD"'
              );
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "TIME":
              zobejct = z.iso.time(
                'Invalid time format. Expect recive value in this format: "HH:MM:SS[.s+]".'
              );
              if (schema.nullable) zobejct = zobejct.nullable();
              break;

            case "OBJECT":
              if (!schema.objectSchemas)
                throw new Error(
                  'Conversion failed to load field schemas type "OBJECT".'
                );
              zobejct = this.createZodJsonObjectSchemaObject({
                jsonObjectSchemas: schema.objectSchemas.getItems(),
              });
              break;

            default:
              throw new Error("Invalid schema type.");
          }

          // Verifica se é uma coleção de dados
          if (schema.isCollection) zobejct = z.array(zobejct);

          return [schema.name, zobejct];
        })
      )
    );

    return !toArray ? dinamicZodSchema : z.array(dinamicZodSchema);
  }
}
