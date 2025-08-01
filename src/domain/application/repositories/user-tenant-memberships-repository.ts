import { UserTenantMembership } from "src/domain/enterprise/entities/user-tenant-membership";

export interface UserTenantMembershipsRepository {
  findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<UserTenantMembership | null>;
  findManyByUser(userId: string): Promise<UserTenantMembership[]>;
  findManyByTenant(tenantId: string): Promise<UserTenantMembership[]>;
  updateLastAccess(userId: string, tenantId: string): Promise<boolean>;
  create(membership: UserTenantMembership): Promise<void>;
  save(membership: UserTenantMembership): Promise<void>;
  delete(membership: UserTenantMembership): Promise<void>;
}
