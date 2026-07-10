import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { loginResponse } from '../models/auth.model'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const token = localStorage.getItem('accessToken');
  
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401) {
        console.log('Token expired! Refreshing token...');
        
        return authService.refreshToken().pipe(
          switchMap((res: loginResponse) => {
            localStorage.setItem('accessToken', res.access_token);
            
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access_token}` }
            });
            return next(newReq);
          }),
          catchError((refreshErr) => {
            console.error('Refresh token failed. Logging out...');
            return throwError(() => refreshErr);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};