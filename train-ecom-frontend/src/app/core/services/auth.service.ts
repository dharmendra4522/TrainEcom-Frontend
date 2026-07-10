import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loginRequest, loginResponse, registerRequest, registerResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginAPI = 'http://192.168.3.177:7112/api/Auth/login';
  private registerAPI = 'http://192.168.3.177:7112/api/Auth/register';

  private http = inject(HttpClient);

  login(credentials: loginRequest): Observable<loginResponse> {
    return this.http.post<loginResponse>(this.loginAPI, credentials);
  }

  register(userData: registerRequest): Observable<registerResponse> {
    return this.http.post<registerResponse>(this.registerAPI, userData);
  }

}