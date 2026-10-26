import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiBasicResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  VendorRegisterResponse,
  RegistrationRole,
} from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_HANDLING } from '../interceptors/error.context';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginAPI = `${environment.apiBaseUrl}/auth/login`;
  private registerAPI = `${environment.apiBaseUrl}/users/register`;
  private forgotPasswordAPI = `${environment.apiBaseUrl}/auth/forgot-password`;
  private resetPasswordAPI = `${environment.apiBaseUrl}/auth/reset-password`;

  
  private http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginAPI, credentials, {
      context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
    });
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    const payload = new FormData();
    payload.append('Name', userData.name ?? '');
    payload.append('Email', userData.email ?? '');
    payload.append('Password', userData.password ?? '');
    payload.append('ConfirmPassword', userData.confirmPassword ?? '');
    payload.append('PhoneNumber', userData.phoneNumber ?? '');
    payload.append('Role', String(RegistrationRole.Customer));

    return this.http.post<RegisterResponse>(this.registerAPI, payload, {
      context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
    });
  }

  sendForgotPasswordOtp(email: string): Observable<ApiBasicResponse> {
    return this.http.post<ApiBasicResponse>(this.forgotPasswordAPI, { email });
  }

  resetPasswordWithOtp(
    payload: ResetPasswordRequest,
  ): Observable<ApiBasicResponse> {
    return this.http.post<ApiBasicResponse>(this.resetPasswordAPI, payload);
  }

  vendorRegister(formData: FormData): Observable<VendorRegisterResponse> {
    return this.http.post<VendorRegisterResponse>(
      this.registerAPI,
      formData,
      {
        context: new HttpContext().set(SKIP_ERROR_HANDLING, true),
      },
    );
  }
}
