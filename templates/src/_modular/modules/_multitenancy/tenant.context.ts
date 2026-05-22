import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getCurrentTenantId(): string {
  const ctx = tenantStorage.getStore();
  if (!ctx?.tenantId) throw new Error('No tenant context — request missing x-tenant-id header');
  return ctx.tenantId;
}
