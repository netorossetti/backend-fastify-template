import { randomUUID } from "node:crypto";

const regexUUIDv4 = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);

export class UniqueEntityId {
  private value: string;

  toString() {
    return this.value;
  }

  toValue() {
    return this.value;
  }

  constructor(value?: string) {
    if (value && !regexUUIDv4.test(value))
      throw new Error("Invalid UUID value.");
    this.value = value ?? randomUUID();
  }

  equals(id: UniqueEntityId) {
    return id.toValue() === this.toValue();
  }
}
