import { Role, ROLE_NAME_MAP } from '../models/auth.model';
import { ApprovalStatus } from '../models/user.model';

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

export function normalizeApprovalStatus(
  value: string | number | ApprovalStatus | null | undefined,
): ApprovalStatus | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    if (Object.values(ApprovalStatus).includes(value as ApprovalStatus)) {
      return value as ApprovalStatus;
    }
    return null;
  }

  const normalized = value.trim().toLowerCase();
  const statusMap: Record<string, ApprovalStatus> = {
    pending: ApprovalStatus.Pending,
    approved: ApprovalStatus.Approved,
    rejected: ApprovalStatus.Rejected,
    '1': ApprovalStatus.Pending,
    '2': ApprovalStatus.Approved,
    '3': ApprovalStatus.Rejected,
  };

  return statusMap[normalized] ?? null;
}

export function approvalStatusToLabel(
  value: string | number | ApprovalStatus | null | undefined,
): string {
  const normalized = normalizeApprovalStatus(value);
  switch (normalized) {
    case ApprovalStatus.Pending:
      return 'Pending';
    case ApprovalStatus.Approved:
      return 'Approved';
    case ApprovalStatus.Rejected:
      return 'Rejected';
    default:
      return typeof value === 'string' ? value : 'Pending';
  }
}