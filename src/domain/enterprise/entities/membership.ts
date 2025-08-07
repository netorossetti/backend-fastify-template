import { Entity } from "src/core/entities/entity-uuid";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { Json } from "src/core/types/json";
import { Optional } from "src/core/types/optional";

export type RoleUserType = "user" | "admin" | "superAdmin";

export interface MembershipProps {
  userId: string;
  tenantId: string;
  owner: boolean;
  role: RoleUserType;
  permissions?: Json | null;
  lastAccessAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Membership extends Entity<MembershipProps> {
  get userId() {
    return this.props.userId;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get owner() {
    return this.props.owner;
  }

  get role() {
    return this.props.role;
  }

  get permissions() {
    return this.props.permissions;
  }

  get lastAccessAt() {
    return this.props.lastAccessAt;
  }

  set lastAccessAt(lastAccessAt) {
    if (lastAccessAt !== this.props.lastAccessAt) {
      this.props.lastAccessAt = lastAccessAt;
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
    props: Optional<MembershipProps, "createdAt" | "owner">,
    id?: UniqueEntityId
  ) {
    const instance = new Membership(
      {
        ...props,
        owner: props.owner ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
    return instance;
  }
}
