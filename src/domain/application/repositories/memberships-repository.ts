import { Membership } from "src/domain/enterprise/entities/membership";

export interface MembershipsRepository {
  findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null>;
  findManyByUser(userId: string, active?: boolean): Promise<Membership[]>;
  findManyByTenant(tenantId: string, active?: boolean): Promise<Membership[]>;
  updateLastAccess(userId: string, tenantId: string): Promise<boolean>;
  create(membership: Membership): Promise<Membership>;
  save(membership: Membership): Promise<void>;
  delete(membership: Membership): Promise<boolean>;
}
