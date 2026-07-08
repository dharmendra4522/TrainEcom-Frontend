import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loginRequest, loginResponse, registerRequest, registerResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginAPI = 'https://api.escuelajs.co/api/v1/auth/login';
  private registerAPI = 'http://localhost:3000/customers';
  private refreshAPI = 'https://api.escuelajs.co/api/v1/auth/refresh-token';

  private http = inject(HttpClient);

  login(credentials: loginRequest): Observable<loginResponse> {
    return this.http.post<loginResponse>(this.loginAPI, credentials);
  }

  register(userData: registerRequest): Observable<registerResponse> {
    return this.http.post<registerResponse>(this.registerAPI, userData);
  }

  refreshToken(): Observable<loginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<loginResponse>(this.refreshAPI, { refresh_token: refreshToken });
  }

}