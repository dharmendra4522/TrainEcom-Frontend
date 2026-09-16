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
  accessTokenExpiresAt: string;
  role?: Role;
  isBussinessDetailsCompleted?: boolean | null;
  approvalStatus?: ApprovalStatus;
}

export interface UserSessionPayload {
  token: string;
  role: Role | null;
  isBussinessDetailsCompleted?: boolean | null;
  approvalStatus?: ApprovalStatus;
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
