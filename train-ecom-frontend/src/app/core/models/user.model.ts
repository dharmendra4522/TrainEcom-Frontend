import { Role } from './auth.model';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  defaultAddress: Address | null;
  role: Role;
  submittedDate?: string | null;
  registrationId?: string | null;
  isApproved?: ApprovalStatus | null;
}

export interface VendorBusinessDetail {
  id?: string;
  userId: string;
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
  id: string;
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
}

export interface AdminUser extends Record<string, unknown> {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  isBlocked: boolean;
  isApproved?: ApprovalStatus;
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
  search?: string;
  status?: string;
  role?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UpdateUserStatusPayload {
  isBlocked: boolean;
}

export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface VendorBusinessDetails {
  businessName: string;
  gstNumber: string;
  panNumber: string;
  businessAddress: BusinessAddress;
}

export interface BusinessAddress {
  id?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: number;
}
