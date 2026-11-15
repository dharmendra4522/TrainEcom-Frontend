import type { ApprovalStatus } from './user.model';

export enum Role {
  Customer = 1,
  Vendor = 2,
  Admin = 3,
  Accountant = 4,
  OfficeAdmin = 5,
  StoreMananger = 6,
  InventoryManager = 7,
  OrderManager = 8,
  CustomerSupport = 9,
  ProductEditor = 10
}

export enum RegistrationRole {
  Customer = 1,
  Vendor = 2,
}

export const ROLE_NAME_MAP: Record<number, string> = {
  [Role.Customer]: 'Customer',
  [Role.Vendor]: 'Vendor',
  [Role.Admin]: 'Admin',
  [Role.Accountant]: 'Accounting',
  [Role.OfficeAdmin]: 'OfficeAdmin',
  [Role.StoreMananger]: 'StoreManager',
  [Role.InventoryManager]: 'InventoryManager',
  [Role.OrderManager]: 'OrderManager',
  [Role.CustomerSupport]: 'CustomerSupport',
  [Role.ProductEditor]: 'ProductEditor'
};

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
  status?: ApprovalStatus | number | string | null;
  expiresAt?: number | null;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role?: RegistrationRole;
  bussinessDetails?: BusinessDetailsPayload;
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
  bussinessDescription: string;
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
  accountHolderName?: string;
  ifscCode?: string;
}

export interface VendorRegisterResponse {
  success: boolean;
  message: string;
}

export interface NominatimResponse {
  display_name: string;
  address: NominatimAddress;
}

export interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  state?: string;
  country?: string;
  postcode?: string;
  road?: string;
  house_number?: string;
  industrial?: string;
  suburb?: string;
}

export interface AutoFilledAddress {
  addressLine1: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
}