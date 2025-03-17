import { randomUUID } from "node:crypto";
import { z, ZodSchema } from "zod";

export class Entity<Props> {
  private _id: number;

  protected props: Props;

  get id() {
    return this._id;
  }

  protected constructor(props: Props, id?: number) {
    this._id = id ?? this.generateTemporaryId();

    this.props = props;
  }

  private generateTemporaryId(): number {
    const uuid = randomUUID().replace(/-/g, "");
    let randomNumber = BigInt(`0x${uuid}`).toString().slice(0, 16);
    return -Math.abs(Number(randomNumber));
  }

  public equals(entity: Entity<unknown>) {
    if (entity === this) return true;
    if (entity.id === this._id) return true;
    return false;
  }

  public isNew() {
    return this._id <= 0;
  }

  /**
   * Método para converter a instância em um objeto plano.
   */
  public toPlainObject(): Props {
    return { id: this.id, ...this.props };
  }

  /**
   * Método para criar um schema Zod com base nas propriedades da entidade.
   */
  public toZodSchema(): ZodSchema {
    const schemaDefinition: Record<string, ZodSchema> = {};

    // Fazendo uma type assertion para tratar `this.props` como um objeto indexável
    for (const [key, value] of Object.entries(
      this.props as Record<string, unknown>
    )) {
      schemaDefinition[key] = this.getZodType(value);
    }

    return z.object(schemaDefinition);
  }

  /**
   * Método auxiliar para inferir tipos Zod com base no valor.
   */
  private getZodType(value: unknown): ZodSchema {
    if (typeof value === "string") return z.string();
    if (typeof value === "number") return z.number();
    if (typeof value === "boolean") return z.boolean();
    if (value instanceof Date) return z.date();
    if (value === null) return z.null();
    if (Array.isArray(value)) {
      const arrayType = value.length ? this.getZodType(value[0]) : z.unknown();
      return z.array(arrayType);
    }
    if (typeof value === "object" && value !== null) {
      const nestedSchema: Record<string, ZodSchema> = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        nestedSchema[nestedKey] = this.getZodType(nestedValue);
      }
      return z.object(nestedSchema);
    }
    return z.unknown();
  }
}
