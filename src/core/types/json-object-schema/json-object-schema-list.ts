import { WatchedList } from "@core/entities/watched-list";
import { JsonObjectSchema } from "./json-object-schema";

export class JsonObjectSchemaList extends WatchedList<JsonObjectSchema> {
  compareItems(a: JsonObjectSchema, b: JsonObjectSchema): boolean {
    return a.equals(b);
  }

  isItemModified(
    initial: JsonObjectSchema,
    current: JsonObjectSchema
  ): boolean {
    if (!this.compareItems(initial, current)) return false;
    if (!initial.updatedAt && !current.updatedAt) return false;
    return !(initial.updatedAt == current.updatedAt);
  }
}
