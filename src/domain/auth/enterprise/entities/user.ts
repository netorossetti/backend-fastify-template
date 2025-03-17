import { Entity } from "src/core/entities/entity-uuid";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { Optional } from "src/core/types/optional";

export type RoleUserType = "user" | "admin" | "superAdmin";

export interface UserProps {
  name: string;
  email: string;
  active: boolean;
  password: string;
  role: RoleUserType;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get email() {
    return this.props.email;
  }

  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  get active() {
    return this.props.active;
  }

  set active(active: boolean) {
    this.props.active = active;
    this.touch();
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  get role() {
    return this.props.role;
  }

  set role(role) {
    this.props.role = role;
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
    props: Optional<UserProps, "active" | "createdAt">,
    id?: UniqueEntityId
  ) {
    const user = new User(
      {
        ...props,
        active: props.active ?? true,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
    return user;
  }
}
