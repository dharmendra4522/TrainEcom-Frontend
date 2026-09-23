import type { ApprovalStatus } from './user.model';

export enum Role {
  Customer = 1,
  Vendor = 2,
  Admin = 3,
  Accounting = 4,
  OfficeAdmin = 5,
}

export enum RegistrationRole {
  Customer = 1,
  Vendor = 2,
}

export const ROLE_NAME_MAP: Record<number, string> = {
  [Role.Customer]: 'Customer',
  [Role.Vendor]: 'Vendor',
  [Role.Admin]: 'Admin',
  [Role.Accounting]: 'Accounting',
  [Role.OfficeAdmin]: 'OfficeAdmin',
};

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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt?: string;
  role?: Role | number | null;
  submittedDate?: string;
  registrationId?: string;
  status?: ApprovalStatus | string | number | null;
  approvalStatus?: ApprovalStatus | string | number | null;
  expireTime?: string;
}

export interface UserSessionPayload {
  token: string;
  role: Role | number | null;
  submittedDate?: string | null;
  registrationId?: string | null;
  approvalStatus?: ApprovalStatus | number | null;
  status?: ApprovalStatus | number | null;
  expiresAt?: number | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role?: RegistrationRole;
  businessDetails?: BusinessDetailsPayload;
}

export interface BusinessDetailsPayload {
  bussinessName: string;
  bussinessDescription: string;
  storeName: string;
  gstin: string;
  pan: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  categoryIds: number[];
  logo?: File;
  bussinessDocument?: File;
  gstDocument?: File;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface BackendError {
  error?: { message?: string };
  message?: string;
  StatusCode?: number;
  Message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiBasicResponse {
  success: boolean | number;
  message: string;
}

export interface VendorRegisterFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  displayName: string;
  businessDescription: string;
  businessCategory: string | string[];
  gstDocument?: File | string;
  businessDocument?: File | string;
  businessLogo?: File | string;
  gstin: string;
  panNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  bankAccountNumber?: string | number;
  acountHolderName?: string;
  ifscCode?: string;
}

export interface VendorRegisterResponse {
  success: boolean;
  message: string;
}

