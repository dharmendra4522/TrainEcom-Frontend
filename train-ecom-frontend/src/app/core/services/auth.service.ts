import { Injectable } from '@angular/core';
import { loginRequest, loginResponse } from '../../models/auth.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/internal/operators/tap';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginAPI = 'https://api.escuelajs.co/api/v1/auth/login';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasAccessToken());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private hasAccessToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  constructor(private http: HttpClient) { }

  login(credentials: loginRequest): Observable<loginResponse> {
    return this.http.post<loginResponse>(`${this.loginAPI}`, credentials).pipe(
      tap((response: loginResponse) => {
        if (response && response.access_token) {
          localStorage.setItem('accessToken', response.access_token);
          localStorage.setItem('refreshToken', response.refresh_token);
          this.isLoggedInSubject.next(true);  
        }
      })
    )
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.isLoggedInSubject.next(false);
  }

}
