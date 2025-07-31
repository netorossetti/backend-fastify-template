import { z } from "zod/v4";
import { JsonObjectSchema } from "../types/json-object-schema/json-object-schema";
import { JsonObjectSchemaList } from "../types/json-object-schema/json-object-schema-list";
import { ZodHelper } from "./zod-helper";

describe("Zod Helper", () => {
  test("Create DataSource Schema Object", async () => {
    // Crie um objeto com propriedades dinâmicas usando .shape()
    const zodDinamicSchema = ZodHelper.createZodJsonObjectSchemaObject({
      jsonObjectSchemas: dbSchemas,
    });

    // Valide os dados usando o schema
    const dadosAValidarArray = [
      {
        id: 1,
        titulo: "musica",
        descricao: "descricao",
        data: new Date(),
        valor: "R$10.123,55",
        datacurta: "2020-01-01",
        hora: "09:52:31",
      },
      {
        id: 2,
        titulo: "cor",
        descricao: "descricao",
        data: new Date(),
        valor: "R$23,55",
        datacurta: null,
        hora: "10:22:55",
      },
      {
        id: 3,
        titulo: "fruta",
        descricao: null,
        data: null,
        valor: "R$1.029.010.123,55",
        datacurta: "3001-10-12",
        hora: null,
      },
    ];
    const arraySchema = z.array(zodDinamicSchema);
    const result = arraySchema.safeParse(dadosAValidarArray);

    expect(result.success).toBe(true);
  });
});

// Shema de teste
const dbSchemas: JsonObjectSchema[] = [
  JsonObjectSchema.create({
    dataSourceId: 1,
    name: "id",
    description: "Identificador da fonte de dados 1",
    label: "ID",
    isUnique: true,
    length: 6,
    precision: 0,
    nullable: false,
    type: "INTEGER",
  }),
  JsonObjectSchema.create({
    dataSourceId: 1,
    name: "titulo",
    description: "Titulo da fonte de dados 1",
    label: "Titulo",
    isUnique: false,
    length: 10,
    precision: 0,
    nullable: false,
    type: "TEXT",
  }),
  JsonObjectSchema.create({
    dataSourceId: 1,
    name: "descricao",
    description: "Descrição da fonte de dados 1",
    label: "Descrição",
    isUnique: false,
    length: 30,
    precision: 0,
    nullable: true,
    type: "TEXT",
  }),
  JsonObjectSchema.create({
    dataSourceId: 1,
    name: "data",
    description: "Data de criacao",
    label: "Descrição",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "DATETIME",
  }),
  JsonObjectSchema.create({
    dataSourceId: 1,
    name: "valor",
    description: "valor",
    label: "valor",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "MONEY",
  }),
  JsonObjectSchema.create({
    dataSourceId: 1,
    name: "datacurta",
    description: "Data Curta",
    label: "Data Curta",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "DATE",
  }),

  JsonObjectSchema.create({
    dataSourceId: 1,
    name: "hora",
    description: "Hora",
    label: "Hora",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "TIME",
  }),
];

// Shema de teste
const dbFormSchemas: JsonObjectSchema[] = [
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "id",
    description: "Identificador da fonte de dados 1",
    label: "ID",
    isUnique: true,
    length: 6,
    precision: 0,
    nullable: false,
    type: "INTEGER",
  }),
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "titulo",
    description: "Titulo da fonte de dados 1",
    label: "Titulo",
    isUnique: false,
    length: 10,
    precision: 0,
    nullable: false,
    type: "TEXT",
  }),
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "descricao",
    description: "Descrição da fonte de dados 1",
    label: "Descrição",
    isUnique: false,
    length: 30,
    precision: 0,
    nullable: true,
    type: "TEXT",
  }),
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "data",
    description: "Data de criacao",
    label: "Descrição",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "DATETIME",
  }),
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "valor",
    description: "valor",
    label: "valor",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "MONEY",
  }),
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "datacurta",
    description: "Data Curta",
    label: "Data Curta",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "DATE",
  }),

  JsonObjectSchema.create({
    formFlowId: 1,
    name: "hora",
    description: "Hora",
    label: "Hora",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "TIME",
  }),

  JsonObjectSchema.create({
    formFlowId: 1,
    name: "arrayType",
    description: "Coleção",
    label: "Coleção",
    isUnique: false,
    length: 0,
    precision: 0,
    nullable: true,
    type: "INTEGER",
    isCollection: true,
  }),
];

const objectTypeSchema = JsonObjectSchema.create({
  formFlowId: 1,
  name: "objectType",
  description: "Objeto",
  label: "Objeto",
  isUnique: false,
  length: 0,
  precision: 0,
  nullable: true,
  type: "OBJECT",
  isCollection: true,
});

if (!objectTypeSchema.objectSchemas)
  objectTypeSchema.objectSchemas = new JsonObjectSchemaList();

objectTypeSchema.objectSchemas.add(
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "id",
    description: "Identificador da fonte de dados 1",
    label: "ID",
    isUnique: true,
    length: 6,
    precision: 0,
    nullable: false,
    type: "INTEGER",
    parentSchemaId: objectTypeSchema.id,
  })
);
objectTypeSchema.objectSchemas.add(
  JsonObjectSchema.create({
    formFlowId: 1,
    name: "titulo",
    description: "Titulo da fonte de dados 1",
    label: "Titulo",
    isUnique: false,
    length: 10,
    precision: 0,
    nullable: false,
    type: "TEXT",
    parentSchemaId: objectTypeSchema.id,
  })
);

dbFormSchemas.push(objectTypeSchema);
