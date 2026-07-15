import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loginRequest, loginResponse, registerRequest, registerResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginAPI = `${environment.apiBaseUrl}/auth/login`;
  private registerAPI = `${environment.apiBaseUrl}/auth/register`;

  private http = inject(HttpClient);

  login(credentials: loginRequest): Observable<loginResponse> {
    return this.http.post<loginResponse>(this.loginAPI, credentials);
  }

  register(userData: registerRequest): Observable<registerResponse> {
    return this.http.post<registerResponse>(this.registerAPI, userData);
  }

}