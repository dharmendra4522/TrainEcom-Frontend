export interface UserProfile {
    id: string,
    name: string;
    email: string;
    phoneNumber: string;
    defaultAddress: Address | null;
    
}

export interface Address{
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

