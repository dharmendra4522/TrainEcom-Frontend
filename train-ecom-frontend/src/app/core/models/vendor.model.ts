
import type {
  AdminUserFilterParams,
  ApprovalStatus,
  UserStatusFilter,
} from './user.model';

export interface VendorItem {
  vendorId?: number;
  userId?: number;
  name?: string;
  bussinessName?: string;
  email: string;
  phoneNumber: string;
  city?: string;
  isBlocked?: boolean;
  categories?: string[];
  status?: ApprovalStatus | number;
  approvalStatus?: ApprovalStatus | number;
  bussinessDetail?: {
    bussinessName?: string;
    bussinessCategories?: string[];
  };
}

export interface VendorTableItem extends VendorItem {
  id: number;
  statusDisplay: string;
  vendorStatusClass: string;
  isBlockedDisplay: string;
  isBlockedClass: string;
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


export interface VendorFilterParams extends AdminUserFilterParams {
  status?: ApprovalStatus | number | string;
  isBlocked?: UserStatusFilter | boolean | string | 'All';
}

export type vendorFilterParams = VendorFilterParams;