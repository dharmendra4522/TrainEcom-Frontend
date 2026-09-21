import { ApprovalStatus } from './user.model';

export enum Role {
  Admin = 'Admin',
  Customer = 'Customer',
  Vendor = 'Vendor',
  OfficeAdmin = 'OfficeAdmin',
  Accounting = 'Accounting',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt?: string;
  role?: Role;
  submittedDate?: string;
  registrationId?: string;
  status?: ApprovalStatus | string;
  approvalStatus?: ApprovalStatus | null;
  expireTime?: string;
}

export interface UserSessionPayload {
  token: string;
  role: Role | null;
  submittedDate?: string | null;
  registrationId?: string | null;
  approvalStatus?: ApprovalStatus | string | null;
  status?: string | null;
  expiresAt?: number | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
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
  data: {
    accessToken: string;
    submittedDate: string;
    registrationId: string;
    status: string;
  };
}
