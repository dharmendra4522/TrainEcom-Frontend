import { Role } from '../models/auth.model';

export type PortalKey = 'admin' | 'vendor';
export type ManagementFeature = 'products.manage' | 'orders.manage';

/** Central access for manage reusable screens. */
export const PORTAL_ACCESS: Record<PortalKey, readonly Role[]> = {
  admin: [Role.Admin],
  vendor: [Role.Vendor],
};

export const FEATURE_ACCESS: Record<
  PortalKey,
  Record<ManagementFeature, readonly Role[]>
> = {
  admin: {
    'products.manage': [Role.Admin],
    'orders.manage': [Role.Admin],
  },
  vendor: {
    'products.manage': [Role.Vendor],
    'orders.manage': [Role.Vendor],
  },
};

export function isPortalKey(value: string | undefined): value is PortalKey {
  return value === 'admin' || value === 'vendor';
}

export function isManagementFeature(
  value: unknown,
): value is ManagementFeature {
  return value === 'products.manage' || value === 'orders.manage';
}
