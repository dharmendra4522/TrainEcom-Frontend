import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectAuthStatus,
  selectIsLoggedIn,
  selectUserRole,
} from '../store/auth/auth.selectors';
import { map, take, withLatestFrom } from 'rxjs/operators';
import { Role, normalizeRole } from '../models/auth.model';

export const publicGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsLoggedIn).pipe(
    take(1),
    withLatestFrom(
      store.select(selectUserRole),
      store.select(selectAuthStatus),
    ),
    map(([isLoggedIn, role]) => {
      if (isLoggedIn && role) {
        const normalizedRole = normalizeRole(role as string | number | null | undefined);

        if (normalizedRole === Role.Admin) {
          return router.createUrlTree(['/admin/dashboard']);
        }

        if (normalizedRole === Role.Vendor) {
          return router.createUrlTree(['/vendor/dashboard']);
        }
        return router.createUrlTree(['/']);
      }
      return true;
    }),
  );
};
