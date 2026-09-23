import { VendorDetails } from './vendor.model';
import type { Role } from './auth.model';

export enum UserStatusFilter {
  All = 1,
  Active = 2,
  Blocked = 3,
}

export enum ApprovalStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

// Normalize Approval Status
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

export interface ProfileVendorDetails {
  id?: number;
  userId?: number;
  businessName?: string | null;
  storeName?: string | null;
  businessDescription?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | number | null;
  gstin?: string | null;
  pan?: string | null;
  accountHolderName?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  categories?: string[] | null;
  documentUrls?: string[] | null;
  defaultAddress?: {
    addressLine1: string;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | number | null;
  }
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  defaultAddress: Address | null;
  role: Role | number;
  vendorDetails?: ProfileVendorDetails | null;
  submittedDate?: string | null;
  registrationId?: string | null;
  isApproved?: ApprovalStatus | number | null;
}

export interface VendorBusinessDetail {
  id?: number;
  userId: number;
  CompanyName: string;
  CompanyOverview: string;
  StoreName: string;
  gstin: string;
  pan: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  rejectionReason?: string | null;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface UpdateProfilePayload {
  name: string;
  phoneNumber: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  businessDetails? :{
    businessName: string | null;
    storeName: string | null;
    businessDescription: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    gstin: string | null;
    pan: string | null;
    accountHolderName: string | null;
    bankAccountNumber: string | null;
    ifscCode: string | null;
    categories?: string[] | null;      
    documentUrls?: string[] | null
  };
  defaultAddress?: {
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | number | null;
  };
}

export interface AdminUser extends Record<string, unknown> {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string;
  role?: Role | number;
  approvalStatus?: ApprovalStatus | number | null;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  isBlocked: boolean;
  isApproved?: ApprovalStatus | number | null;
  userStatusClass?: string;
}

export interface AdminUserListResponse {
  items: AdminUser[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface AdminUserFilterParams {
  Search?: string;
  search?: string;
  Role?: Role | number;
  role?: Role | number | string;
  ApprovalStatus?: ApprovalStatus | number;
  approvalStatus?: ApprovalStatus | number | string;
  UserStatus?: UserStatusFilter | number;
  status?: UserStatusFilter | number | string;
  PageNumber?: number;
  pageNumber?: number;
  PageSize?: number;
  pageSize?: number;
}

export interface UpdateUserStatusPayload {
  isBlocked: boolean;
}

export interface VendorBusinessDetails {
  businessName: string;
  gstNumber: string;
  panNumber: string;
  businessAddress: BusinessAddress;
}

export interface BusinessAddress {
  id?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: number;
}

