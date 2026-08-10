import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_HANDLING } from './error.context';
import { extractBackendMessage } from '../utils/error.utils';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth/auth.actions';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  const store = inject(Store);


  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // If the SKIP_ERROR_HANDLING context token is set to true for this request, we skip the error handling logic and simply rethrow the error.
      if (req.context.get(SKIP_ERROR_HANDLING)) {
        return throwError(() => error);
      }


      if (error.status === 401 || error.status === 403) {
        const errorMessage = extractBackendMessage(error);
        localStorage.removeItem('accessToken');
        store.dispatch(AuthActions.logout());
        notificationService.showError(errorMessage);
        router.navigate(['/login']);
      }

      const errorMessage = extractBackendMessage(error);
      notificationService.showError(errorMessage);
      return throwError(() => error);
    }),
  );
};
