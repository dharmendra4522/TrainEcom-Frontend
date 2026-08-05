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
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_HANDLING } from '../interceptors/error.context';

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
    return this.http.post<loginResponse>(this.loginAPI, credentials, {
      context: new HttpContext().set(SKIP_ERROR_HANDLING, true)
    });
  }

  register(userData: registerRequest): Observable<registerResponse> {
    return this.http.post<registerResponse>(this.registerAPI, userData, {
      context: new HttpContext().set(SKIP_ERROR_HANDLING, true)
    });
  }

  sendForgotPasswordOtp(email: string): Observable<ApiBasicResponse>{
    return this.http.post<ApiBasicResponse>(this.forgotPasswordAPI, { email });
  }

  resetPasswordWithOtp(payload: ResetPasswordRequest): Observable<ApiBasicResponse>{
    return this.http.post<ApiBasicResponse>(this.resetPasswordAPI, payload);
  }

}
