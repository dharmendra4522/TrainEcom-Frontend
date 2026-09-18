import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectAuthStatus,
  selectIsLoggedIn,
  selectUserRole,
} from '../store/auth/auth.selectors';
import { map, take, withLatestFrom } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsLoggedIn).pipe(
    take(1),
    withLatestFrom(
      store.select(selectUserRole),
      store.select(selectAuthStatus),
    ),
    map(([isLoggedIn, role, status]) => {
      if (isLoggedIn && role) {
        const normalizedRole = role.toString().toLowerCase();
        
        if (normalizedRole === 'admin') {
          return router.createUrlTree(['/admin/dashboard']);
        }
        
        if (normalizedRole === 'vendor') {
          const normalizedStatus = status
            ? status.toString().toLowerCase()
            : '';

          if (normalizedStatus === 'approved') {
            return router.createUrlTree(['/vendor/dashboard']);
          } else {
            return true;
          }
        }
        return router.createUrlTree(['/']);
      }
      return true;
    }),
  );
};