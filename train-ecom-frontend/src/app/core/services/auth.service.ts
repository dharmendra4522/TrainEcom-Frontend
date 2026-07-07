import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loginRequest, loginResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginAPI = 'https://api.escuelajs.co/api/v1/auth/login';

  private http = inject(HttpClient);

  login(credentials: loginRequest): Observable<loginResponse> {
    return this.http.post<loginResponse>(this.loginAPI, credentials);
  }

}