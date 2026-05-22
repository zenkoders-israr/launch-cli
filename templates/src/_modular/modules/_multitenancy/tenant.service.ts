import { Injectable, NotFoundException } from '@nestjs/common';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Stub service — replace with your ORM repository (TypeORM/Prisma/Drizzle).
 * Inject this anywhere you need to resolve tenant data by ID.
 */
@Injectable()
export class TenantService {
  // TODO: inject your ORM repository here
  private readonly tenants: Tenant[] = [];

  async findById(id: string): Promise<Tenant> {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenants.find((t) => t.slug === slug) ?? null;
  }

  async create(data: { name: string; slug: string }): Promise<Tenant> {
    const tenant: Tenant = {
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      isActive: true,
      createdAt: new Date(),
    };
    this.tenants.push(tenant);
    return tenant;
  }
}
