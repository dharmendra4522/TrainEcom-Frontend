import { ApprovalStatus } from './user.model';

export interface VendorItem {
  vendorId: string;
  bussinessName: string;
  email: string;
  phoneNumber: string;
  city: string;
  status: string;
}

export interface VendorTableItem extends VendorItem {
  id: string;
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
  vendorId: string;
  vendorName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessDescription: string;
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
}

export interface VendorVerifyRequest {
  status: ApprovalStatus;
  rejectionReason?: string;
}
