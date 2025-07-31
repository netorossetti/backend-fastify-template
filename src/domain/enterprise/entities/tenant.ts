import { Entity } from "src/core/entities/entity-uuid";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { Optional } from "src/core/types/optional";

export type DocumentType = "CNH" | "CPF" | "CNPJ";

export interface TenantProps {
  firstName: string;
  lastName: string;
  nickName: string;
  documentType: DocumentType;
  documentNumber: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Tenant extends Entity<TenantProps> {
  get firstName() {
    return this.props.firstName;
  }

  set firstName(firstName) {
    if (firstName !== this.props.firstName) {
      this.props.firstName = firstName;
      this.touch();
    }
  }

  get lastName() {
    return this.props.lastName;
  }

  set lastName(lastName) {
    if (lastName !== this.props.lastName) {
      this.props.lastName = lastName;
      this.touch();
    }
  }

  get nickName() {
    return this.props.nickName;
  }

  set nickName(nickName) {
    if (nickName !== this.props.nickName) {
      this.props.nickName = nickName;
      this.touch();
    }
  }

  get documentType() {
    return this.props.documentType;
  }

  set documentType(documentType) {
    if (documentType !== this.props.documentType) {
      this.props.documentType = documentType;
      this.touch();
    }
  }

  get documentNumber() {
    return this.props.documentNumber;
  }

  set documentNumber(documentNumber) {
    if (documentNumber !== this.props.documentNumber) {
      this.props.documentNumber = documentNumber;
      this.touch();
    }
  }

  get active() {
    return this.props.active;
  }

  set active(active: boolean) {
    if (active !== this.props.active) {
      this.props.active = active;
      this.touch();
    }
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
    props: Optional<TenantProps, "active" | "createdAt">,
    id?: UniqueEntityId
  ) {
    const tenant = new Tenant(
      {
        ...props,
        active: props.active ?? true,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
    return tenant;
  }
}
