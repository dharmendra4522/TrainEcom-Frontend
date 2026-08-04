export enum Role{
    Admin = 'Admin',
    Customer = 'Customer',
}

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

export interface BackendError {
  error?: { message?: string };
  message?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}


export interface ApiBasicResponse{
    success: boolean | number;
    message: string;
}