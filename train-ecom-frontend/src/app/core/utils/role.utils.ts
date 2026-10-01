import { Role, ROLE_NAME_MAP } from '../models/auth.model';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../models/order.model';
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


// Order Normalize
export function normalizeOrderStatus(status: OrderStatus | string | number): string {
  if (typeof status === 'number') {
    switch (status) {
      case OrderStatus.Active: return 'Active';
      case OrderStatus.Shipped: return 'Shipped';
      case OrderStatus.Delivered: return 'Delivered';
      case OrderStatus.Cancelled: return 'Cancelled';
      default: return 'Unknown';
    }
  }
  return String(status ?? 'Pending');
}


// Payment Method Import karein apne model se
export function normalizePaymentMethod(method: PaymentMethod | string | number | null | undefined): string {
  if (method === null || method === undefined) {
    return 'Unknown';
  }

  if (typeof method === 'number') {
    switch (method) {
      case PaymentMethod.CashOnDelivery: return 'Cash on Delivery';
      case PaymentMethod.Card: return 'Card';
      case PaymentMethod.UPI: return 'UPI';
      default: return 'Unknown';
    }
  }

  const str = String(method).trim();
  if (!str) return 'Unknown';

  const numericVal = Number(str);
  if (!Number.isNaN(numericVal)) {
    return normalizePaymentMethod(numericVal);
  }

  return str;
}



export function normalizePaymentStatus(status: PaymentStatus | string | number | null | undefined): string {
  if (status === null || status === undefined) {
    return 'Unknown';
  }
  if (typeof status === 'number') {
    switch (status) {
      case PaymentStatus.Pending: return 'Pending';
      case PaymentStatus.Success: return 'Success';
      case PaymentStatus.Refunded: return 'Refunded';
      case PaymentStatus.Cancelled: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  const str = String(status).trim();
  if (!str) return 'Unknown';

  const numericVal = Number(str);
  if (!Number.isNaN(numericVal)) {
    return normalizePaymentStatus(numericVal);
  }
  return str;
}