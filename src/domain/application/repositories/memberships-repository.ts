import { Membership } from "src/domain/enterprise/entities/membership";
import { UserWithMembership } from "src/domain/enterprise/entities/value-objects/user-with-membership";

export interface MembershipsRepository {
  findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null>;
  findManyByUser(userId: string, active?: boolean): Promise<Membership[]>;
  findManyByTenant(tenantId: string, active?: boolean): Promise<Membership[]>;
  listUsersByTenant(tenantId: string): Promise<UserWithMembership[]>;
  verifyPermissionAdmin(tenantId: string, userId: string): Promise<boolean>;
  updateLastAccess(userId: string, tenantId: string): Promise<boolean>;
  create(membership: Membership): Promise<Membership>;
  save(membership: Membership): Promise<void>;
  delete(membership: Membership): Promise<boolean>;
}
