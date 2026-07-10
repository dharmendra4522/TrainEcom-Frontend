import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth/auth.actions';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  if (req.url.includes('/api/Auth/login') || req.url.includes('/api/Auth/register')) {
    return next(req);
  }

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
        console.warn('Token expired or unauthorized! Logging out...');

        store.dispatch(AuthActions.logout());
      }

      return throwError(() => error);
    })
  );
};