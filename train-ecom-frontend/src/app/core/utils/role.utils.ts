import { Role, ROLE_NAME_MAP } from '../models/auth.model';

export function normalizeRole(
  value: string | number | Role | null | undefined,
): Role | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    if (Object.values(Role).includes(value as Role)) {
      return value as Role;
    }
    return null;
  }

  const normalized = value.trim();
  const map: Record<string, Role> = {
    customer: Role.Customer,
    vendor: Role.Vendor,
    admin: Role.Admin,
    accounting: Role.Accounting,
    officeadmin: Role.OfficeAdmin,
    office_admin: Role.OfficeAdmin,
    officeadminrole: Role.OfficeAdmin,
  };

  if (map[normalized.toLowerCase()]) {
    return map[normalized.toLowerCase()];
  }

  const numericValue = Number(normalized);
  if (!Number.isNaN(numericValue) && Object.values(Role).includes(numericValue as Role)) {
    return numericValue as Role;
  }

  return null;
}

export function getRoleName(
  value: string | number | Role | null | undefined,
): string {
  const role = normalizeRole(value);
  return role === null ? '' : ROLE_NAME_MAP[role] || 'Unknown';
}