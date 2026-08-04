export interface UserProfile {
    id: string,
    name: string;
    email: string;
    phoneNumber: string;
    defaultAddress: Address | null;
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
    }
    isBlocked: boolean;
    userStatusClass?: string
}


export interface AdminUserListResponse {
    items: AdminUser[];
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
}


export interface AdminUserFilterParams {
    search?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
}


export interface UpdateUserStatusPayload{
    isBlocked: boolean;
}