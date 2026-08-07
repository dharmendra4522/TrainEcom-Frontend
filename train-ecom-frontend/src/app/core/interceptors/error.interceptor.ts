import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_HANDLING } from './error.context';
import { extractBackendMessage } from '../utils/error.utils';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // If the SKIP_ERROR_HANDLING context token is set to true for this request, we skip the error handling logic and simply rethrow the error.
      if (req.context.get(SKIP_ERROR_HANDLING)) {
        return throwError(() => error);
      }

      const errorMessage = extractBackendMessage(error);

      if (error.status === 401) {
        router.navigate(['/login']);
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    }),
  );
};
