import type { ApprovalStatus } from './user.model';

export enum VendorStatus {
  Active = 1,
  Pending = 2,
  Rejected = 3,
  Blocked = 4,
}

export enum DocumentType {
  Logo = 1,
  BussinessDocument = 2,
  GSTDocument = 3
}

export interface VendorItem {
  vendorId: number;
  userId: number;
  name?: string;
  businessName?: string;
  email: string;
  phoneNumber: string;
  city?: string;
  gstin?: string;
  pan?: string;
  storeName?: string;
  productCount?: number;
  isBlocked?: boolean;
  categories?: string[];
  status?: VendorStatus | number;
  approvalStatus?: ApprovalStatus | number;
  rejectionReason?: string | null;
  businessDetail?: {
    businessName?: string;
    categories?: string[];
    storeName?: string;
    gstin?: string;
    pan?: string;
    city?: string;
    rejectionReason?: string | null;
  };
}
export interface VendorTableItem extends VendorItem {
  id: number;
  statusDisplay: string;
  vendorStatusClass: string;
  [key: string]: unknown;
}

export interface VendorListResponse {
  items: VendorItem[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface VendorDocument {
  documentType: number;
  documentUrl: string;
  newDocumentUrl?: string
  documentLabel?: string;
}

export interface VendorDetails {
  vendorId: number;
  vendorName: string;
  email: string;
  phoneNumber: string;
  newPhoneNumber?: string | null;
  bussinessName: string;
  bussinessDescription: string;
  storeName: string;
  newStoreName?: string | null;
  gstin: string;
  pan: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: number;
  bankAccountNumber: string;
  newBankAccountNumber?: string | null;
  ifscCode: string;
  newIfscCode?: string | null;
  accountHolderName: string;
  newAccountHolderName?: string | null;
  documents: VendorDocument[];
  categories: string[];
  newCategories?: string[] | null;
  status?: ApprovalStatus | number;
}

export interface VendorVerifyRequest {
  status: ApprovalStatus | number;
  rejectionReason?: string;
}

export interface VendorVerifyResponse {
  message: string;
}

export interface VendorProfileEditValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  businessName: string;
  displayName: string;
  bussinessDescription: string;
  gstin: string;
  panNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  bankAccountNumber: string;
  acountHolderName: string;
  ifscCode: string;
  businessDocument: File | string | null;
  gstDocument: File | string | null;
  businessLogo: File | string | null;
  rejectionReason: string;
}

export interface ProfileFieldConfig {
  label: string;
  key: string;
  isList?: boolean;
  isLink?: boolean;
  docType?: DocumentType;
}

export interface VendorTabConfig {
  label: string;
  fields: ProfileFieldConfig[];
}