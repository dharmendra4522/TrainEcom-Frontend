export type PendingChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export enum RequestStatus {
    Pending = 1,
    Rejected = 2,
    Approved = 3
}

export enum RequestType {
    ProfileUpdate = 1
}

export interface VendorProfileUpdateItem extends Record<string, unknown> {
    requestId: number,
    userId: number,
    requestBy: string,
    requestDate: string,
    requestType: RequestType,
    requestMessage: string,
    rejectionReason: string | null,
    requestStatus: RequestStatus
}

export interface VendorProfileUpdateListResponse {
    items: VendorProfileUpdateItem[];
    pageNumber: number,
    pageSize: number,
    totalRecords: number,
    totalPages: number
}

export interface VerifyProfileRequestPayload {
    requestId: number,
    status: RequestStatus,
    rejectionReason: string,
}

export interface VerifyProfileResponse {
    message: string
}
export interface Element extends Record<string, unknown> {
    id: number,
    requestBy: string,
    requestDate: string,
    requestType: string[],
    requestMesage: string
}

export interface PendingFieldChanges<T = unknown> {
    fieldKey: string,
    fieldName: string,
    oldValue: T,
    newValue: T
    status: PendingChangeStatus,
    requestAt: string
}

export interface VendorPendingProfileRequest {
    vendorId: number,
    changes: Record<string, PendingFieldChanges>
}

// export type ApprovalRequiredFieldKey = 'phoneNumber' | 'displayName' | 'storeName' | 'businessCategory' | 'categories' | 'accountHolderName' | 'bankAccountNumber' | 'ifscCode' | 'businessDocument' | 'doc1' | 'gstDocument' | 'doc2' | 'businessLogo' | 'doc3';

// export type InstantFieldKey = 'firstName' | 'LastName' | 'bussinessDescription' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'country' | 'postalCode'; 