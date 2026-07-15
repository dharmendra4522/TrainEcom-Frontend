import { Role } from "./app.model";


export interface loginRequest{
    email: string;
    password: string;
}

export interface loginResponse {
    accessToken: string; 
    accessTokenExpiresAt: string;
}

export interface UserSessionPayload{
    token: string;
    role: Role | null;
}

export interface registerRequest{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
}

export interface registerResponse{
    success: boolean;
    message: string;
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
export interface BackendError {
  error?: { message?: string };
  message?: string;
}