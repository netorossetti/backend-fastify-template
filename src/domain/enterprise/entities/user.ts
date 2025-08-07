import { Entity } from "src/core/entities/entity-uuid";
import { UniqueEntityId } from "src/core/entities/value-objects/unique-entity-id";
import { Optional } from "src/core/types/optional";

export interface UserProps {
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  active: boolean;
  avatarUrl?: string | null;
  password: string;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class User extends Entity<UserProps> {
  get fullName() {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

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

  get email() {
    return this.props.email;
  }

  set email(email) {
    if (email !== this.props.email) {
      this.props.email = email;
      this.touch();
    }
  }

  get active() {
    return this.props.active;
  }

  set active(active) {
    if (active !== this.props.active) {
      this.props.active = active;
      this.touch();
    }
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  set avatarUrl(avatarUrl) {
    if (avatarUrl !== this.props.avatarUrl) {
      this.props.avatarUrl = avatarUrl;
      this.touch();
    }
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    if (password !== this.props.password) {
      this.props.password = password;
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
    props: Optional<UserProps, "active" | "avatarUrl" | "createdAt">,
    id?: UniqueEntityId
  ) {
    const user = new User(
      {
        ...props,
        active: props.active ?? true,
        avatarUrl: props.avatarUrl ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
    return user;
  }
}
