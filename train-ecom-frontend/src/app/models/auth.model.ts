export interface loginRequest{
    email: string;
    password: string;
}

export interface loginResponse{
    refresh_token: string;
    access_token: string;
}

export enum Role{
    Admin = 'Admin',
    Customer = 'Customer',
}
export interface registerRequest{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    role: Role;
}


export interface Product{
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    brand: string;
}