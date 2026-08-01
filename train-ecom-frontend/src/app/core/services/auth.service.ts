import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiBasicResponse,
  loginRequest,
  loginResponse,
  registerRequest,
  registerResponse,
  ResetPasswordRequest,
} from '../models/auth.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginAPI = `${environment.apiBaseUrl}/auth/login`;
  private registerAPI = `${environment.apiBaseUrl}/auth/register`;
  private forgotPasswordAPI = `${environment.apiBaseUrl}/auth/forgot-password`;
  private resetPasswordAPI = `${environment.apiBaseUrl}/auth/reset-password`;

  private http = inject(HttpClient);

  login(credentials: loginRequest): Observable<loginResponse> {
    return this.http.post<loginResponse>(this.loginAPI, credentials);
  }

  register(userData: registerRequest): Observable<registerResponse> {
    return this.http.post<registerResponse>(this.registerAPI, userData);
  }

  sendForgotPasswordOtp(email: string): Observable<ApiBasicResponse>{
    return this.http.post<ApiBasicResponse>(this.forgotPasswordAPI, { email });
  }

  resetPasswordWithOtp(payload: ResetPasswordRequest): Observable<ApiBasicResponse>{
    return this.http.post<ApiBasicResponse>(this.resetPasswordAPI, payload);
  }

}
