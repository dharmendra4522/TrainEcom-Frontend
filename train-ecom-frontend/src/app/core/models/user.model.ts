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

export interface ProfileVendorDetails {
  id?: number;
  userId?: number;
  bussinessName?: string | null;
  storeName?: string | null;
  bussinessDescription?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  gstin?: string | null;
  pan?: string | null;
  accountHolderName?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  categories?: string[] | null;
  documentUrls?: string[] | null;
  documents?: Array<{
    documentType: number;
    documentUrl: string;
  }> | null;
  approvalStatus?: ApprovalStatus | null;
  status?: ApprovalStatus | null;
  defaultAddress?: {
    addressLine1: string;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
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
  isApproved?: ApprovalStatus | null;
  approvalStatus?: ApprovalStatus | null;
  status?: ApprovalStatus | null;
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
  bussinessDetails?: {
    bussinessName: string | null;
    storeName: string | null;
    bussinessDescription: string | null;
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
    newCategoryIds?: number[] | string[] | null;
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
  status?: number | null;
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
  productCount?: number;
  storeName?: string;
  gstin?: string;
  pan?: string;
  isApproved?: ApprovalStatus | number | null;
  userStatusClass?: string;
  bussinessDetail?: AdminVendorBusinessDetail | null;
  bussinessName?: string;
  categories?: string[];
  bussinessCategories?: string[];
}

export interface AdminVendorBusinessDetail {
  bussinessName?: string;
  bussinessCategories?: string[];
  storeName?: string;
  gstin?: string;
  pan?: string;
  city?: string;
  rejectionReason?: string | null;
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
  searchField?: UserListField;
  requestField?: UserListField;
  role?: Role | number;
  status?: number[];
  approvalStatus?: ApprovalStatus | number;
  userStatus?: UserStatusFilter | number;
  filterIds?: number[];
  bussinessCategoriesIds?: number[];
  pageNumber?: number;
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

export enum UserFilterColumn {
  UserId = 'userId',
  Name = 'name',
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  FormattedAddress = 'formattedAddress',
  BussinessName = 'bussinessName',
  GSTIN = 'gstinNumber',
  PAN = 'panNumber',
  StoreName = 'storeName',
  StatusDisplay = 'statusDisplay',
  CategoriesDisplay = 'categoriesDisplay'
}

export enum UserListField {
  Name = 1,
  Email = 2,
  PhoneNumber = 3,
  AddressCity = 4,
  AddressState = 5,
  AddressCountry = 6,
  ProductCount = 7,
  BussinessName = 8,
  StoreName = 9,
  City = 10,
  GSTIN = 11,
  PAN = 12,
  BussinessCategories = 13,
  UserID= 14
}