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