import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_HANDLING } from './error.context';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // If the SKIP_ERROR_HANDLING context token is set to true for this request, we skip the error handling logic and simply rethrow the error. This allows certain requests to bypass the global error handling mechanism if needed.
      if (req.context.get(SKIP_ERROR_HANDLING)) {
        return throwError(() => error);
      }

      let errorMessage = 'An unknown error occurred!';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        const backendMsg = error.error?.message || error.error?.title;
        switch (error.status) {
          case 400:
            errorMessage = backendMsg || 'Bad Request (400)';
            break;
          case 401:
            errorMessage = backendMsg || 'Session expired. Please login again.';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = backendMsg || 'You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = backendMsg || 'Requested resource not found (404).';
            break;
          case 500:
            errorMessage = backendMsg || 'Internal Server Error. Please try again later.';
            break;
          default:
            errorMessage = backendMsg || `Server Error: ${error.status}`;
            break;
        }
      }
      notificationService.showError(errorMessage);
      return throwError(() => error);
    }),
  );
};
