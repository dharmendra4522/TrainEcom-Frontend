export interface loginRequest{
    email: string;
    password: string;
}

export interface loginResponse{
    refresh_token: string;
    access_token: string;
}

export interface registerRequest{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string;
    avtar?: string;
}

export interface registerResponse{
    access_token: string;
    refersh_token: string;
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