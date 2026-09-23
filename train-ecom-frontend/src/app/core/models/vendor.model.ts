import type { ApprovalStatus } from './user.model';

export interface VendorItem {
  vendorId: number;
  name?: string;
  bussinessName: string;
  email: string;
  phoneNumber: string;
  city: string;
  categories?: string[];
  status: ApprovalStatus | number;
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

export interface VendorDetails {
  vendorId: number;
  vendorName: string;
  email: string;
  phoneNumber: string;
  bussinessName: string;
  bussinessDescription: string;
  storeName: string;
  gstin: string;
  pan: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: number;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  documents: string[];
  categories: string[];
  status?: ApprovalStatus | number;
}

export interface VendorVerifyRequest {
  status: ApprovalStatus | number;
  rejectionReason?: string;
}

export interface VendorVerifyResponse {
  message: string;
}
