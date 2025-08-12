import { MembershipsRepository } from "src/domain/application/repositories/memberships-repository";
import { Membership } from "src/domain/enterprise/entities/membership";
import { UserWithMembership } from "src/domain/enterprise/entities/value-objects/user-with-membership";
import { InMemoryUsersRepository } from "./in-memory-users-repository";

export class InMemoryMembershipsRepository implements MembershipsRepository {
  public items: Membership[] = [];

  private usersRepository?: InMemoryUsersRepository;

  setUsersRepository(repo: InMemoryUsersRepository) {
    this.usersRepository = repo;
  }

  async findById(id: string): Promise<Membership | null> {
    const membership = this.items.find((u) => u.id.toString() === id);
    return membership ?? null;
  }

  async findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<Membership | null> {
    const membership = this.items.find(
      (u) => u.userId === userId && u.tenantId === tenantId
    );
    return membership ?? null;
  }

  async findManyByUser(
    userId: string,
    active?: boolean
  ): Promise<Membership[]> {
    const memberships = this.items.filter((u) => {
      let inFilter = u.userId === userId;
      if (inFilter && active !== undefined) {
        inFilter = u.active === active;
      }
      return inFilter;
    });
    return memberships;
  }

  async findManyByTenant(
    tenantId: string,
    active?: boolean
  ): Promise<Membership[]> {
    const memberships = this.items.filter((u) => {
      let inFilter = u.tenantId === tenantId;
      if (inFilter && active !== undefined) {
        inFilter = u.active === active;
      }
      return inFilter;
    });
    return memberships;
  }

  async listUsersByTenant(tenantId: string): Promise<UserWithMembership[]> {
    if (!this.usersRepository)
      throw new Error(
        "InMemoryMembershipsRepository: usersRepository not provider."
      );

    const memberships = await this.items.filter((i) => i.tenantId === tenantId);

    const users: UserWithMembership[] = [];
    for (const membership of memberships) {
      const user = this.usersRepository.items.find(
        (u) => u.id.toString() === membership.userId
      );
      if (!user)
        throw new Error(
          "InMemoryMembershipsRepository: usersRepository not have user with membership."
        );

      users.push(
        UserWithMembership.create({
          userId: membership.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          nickName: user.nickName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          owner: membership.owner,
          role: membership.role,
          permissions: membership.permissions,
          lastAccessAt: membership.lastAccessAt,
          active: membership.active,
        })
      );
    }

    return users;
  }

  async verifyPermissionAdmin(
    tenantId: string,
    userId: string
  ): Promise<boolean> {
    const membership = this.items.find(
      (i) => i.tenantId === tenantId && i.userId === userId
    );
    if (!membership) return false;
    return (
      membership.owner ||
      membership.role === "superAdmin" ||
      membership.role === "admin"
    );
  }

  async updateLastAccess(userId: string, tenantId: string): Promise<boolean> {
    const itemIndex = this.items.findIndex(
      (u) => u.userId === userId && u.tenantId === tenantId
    );
    if (itemIndex !== -1) {
      this.items[itemIndex].lastAccessAt = new Date();
      return true;
    }
    return false;
  }

  async create(membership: Membership): Promise<Membership> {
    if (membership.isNew()) {
      this.items.push(membership);
      return membership;
    }
    throw new Error("Membership is not a new register.");
  }

  async save(membership: Membership): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === membership.id);
    if (itemIndex !== -1) {
      this.items[itemIndex] = membership;
    }
  }

  async delete(membership: Membership): Promise<boolean> {
    const newItems = this.items.filter((i) => i.id !== membership.id);
    const excluded = newItems.length < this.items.length;
    this.items = newItems;
    return excluded;
  }
}
