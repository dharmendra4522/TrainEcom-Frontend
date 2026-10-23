export type PendingChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

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

export type ApprovalRequiredFieldKey = 'phoneNumber' | 'displayName' | 'storeName' | 'businessCategory' | 'categories' | 'accountHolderName' | 'bankAccountNumber' | 'ifscCode' | 'businessDocument' | 'doc1' | 'gstDocument' | 'doc2' | 'businessLogo' | 'doc3';

export type InstantFieldKey = 'firstName' | 'LastName' | 'bussinessDescription' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'country' | 'postalCode';