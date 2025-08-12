import { ValueObject } from "src/core/entities/value-object";
import { Json } from "src/core/types/json";
import { RoleUserType } from "../membership";

export interface UserWithMembershipProps {
  userId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  avatarUrl?: string | null;
  owner: boolean;
  role: RoleUserType;
  permissions?: Json | null;
  lastAccessAt?: Date | null;
  active: boolean;
}

export class UserWithMembership extends ValueObject<UserWithMembershipProps> {
  get userId() {
    return this.props.userId;
  }

  get firstName() {
    return this.props.firstName;
  }

  get lastName() {
    return this.props.lastName;
  }

  get nickName() {
    return this.props.nickName;
  }

  get email() {
    return this.props.email;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
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

  get active() {
    return this.props.active;
  }

  static create(props: UserWithMembershipProps) {
    const user = new UserWithMembership({
      ...props,
    });
    return user;
  }
}
