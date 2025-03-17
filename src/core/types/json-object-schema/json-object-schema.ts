import { Entity } from "@core/entities/entity";
import { Optional } from "@core/types/optional";
import { JsonObjectSchemaList } from "./json-object-schema-list";

export type enumTypeJsonObjectSchema =
  | "TEXT"
  | "INTEGER"
  | "DECIMAL"
  | "MONEY"
  | "DATETIME"
  | "BOOLEAN"
  | "DATE"
  | "TIME"
  | "OBJECT";

interface JsonObjectSchemaProps {
  dataSourceId?: number | null;
  formFlowId?: number | null;
  name: string;
  description: string;
  label: string;
  type: enumTypeJsonObjectSchema;
  isUnique: boolean;
  length: number;
  precision: number;
  nullable: boolean;
  isCollection?: boolean;
  parentSchemaId?: number | null;
  objectSchemas?: JsonObjectSchemaList;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class JsonObjectSchema extends Entity<JsonObjectSchemaProps> {
  get dataSourceId() {
    return this.props.dataSourceId;
  }

  set dataSourceId(dataSourceId: number | null | undefined) {
    this.props.dataSourceId = dataSourceId;
    this.touch();
  }

  get formFlowId() {
    return this.props.formFlowId;
  }

  set formFlowId(formFlowId: number | null | undefined) {
    this.props.formFlowId = formFlowId;
    this.touch();
  }

  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get description() {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
    this.touch();
  }

  get label() {
    return this.props.label;
  }

  set label(label: string) {
    this.props.label = label;
    this.touch();
  }

  get type() {
    return this.props.type;
  }

  set type(type: enumTypeJsonObjectSchema) {
    this.props.type = type;
    this.touch();
  }

  get isUnique() {
    return this.props.isUnique;
  }

  set isUnique(isUnique: boolean) {
    this.props.isUnique = isUnique;
    this.touch();
  }

  get length() {
    return this.props.length;
  }

  set length(length: number) {
    this.props.length = length;
    this.touch();
  }

  get precision() {
    return this.props.precision;
  }

  set precision(precision: number) {
    this.props.precision = precision;
    this.touch();
  }

  get nullable() {
    return this.props.nullable;
  }

  set nullable(nullable: boolean) {
    this.props.nullable = nullable;
    this.touch();
  }

  get isCollection() {
    return this.props.isCollection;
  }

  set isCollection(isCollection: boolean | undefined) {
    this.props.isCollection = !isCollection ? false : isCollection;
    this.touch();
  }

  get parentSchemaId() {
    return this.props.parentSchemaId;
  }

  set parentSchemaId(parentSchemaId: number | null | undefined) {
    this.props.parentSchemaId = parentSchemaId ?? null;
    this.touch();
  }

  get objectSchemas() {
    return this.props.objectSchemas;
  }

  set objectSchemas(objectSchemas: JsonObjectSchemaList | undefined) {
    this.props.objectSchemas = objectSchemas;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    if (!this.isNew()) this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      JsonObjectSchemaProps,
      "isCollection" | "parentSchemaId" | "objectSchemas" | "createdAt"
    >,
    id?: number
  ) {
    const jsonObjectSchema = new JsonObjectSchema(
      {
        ...props,
        isCollection: props.isCollection ?? false,
        parentSchemaId: props.parentSchemaId ?? null,
        objectSchemas: props.objectSchemas ?? new JsonObjectSchemaList(),
        createdAt: new Date(),
      },
      id
    );
    return jsonObjectSchema;
  }
}
