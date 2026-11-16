export enum RequestStatus {
    Pending = 1,
    Rejected = 2,
    Approved = 3
}

export enum RequestType {
    ProfileUpdate = 1
}

export interface VendorProfileUpdateItem extends Record<string, unknown> {
    requestId: number;
    userId: number;
    requestBy: string;
    requestDate: string;
    requestType: RequestType;
    requestTypeLabel:string;
    requestMessage: string;
    rejectionReason: string | null;
    requestStatus: RequestStatus
}

export interface VendorProfileUpdateListResponse {
    items: VendorProfileUpdateItem[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number
}

export interface VerifyProfileRequestPayload {
    requestId: number;
    status: RequestStatus;
    rejectionReason: string;
}

export interface VerifyProfileResponse {
    message: string
}