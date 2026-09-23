import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/internal/operators/take';
import { selectIsLoggedIn, selectUserRole } from '../store/auth/auth.selectors';
import { withLatestFrom } from 'rxjs/internal/operators/withLatestFrom';
import { map } from 'rxjs/internal/operators/map';
import { Role, normalizeRole } from '../models/auth.model';

export const customerGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  // this guard checks if the user is logged in and has the role of 'Customer'. If not, it redirects them to the login page or admin dashboard based on their role.
  return store.select(selectIsLoggedIn).pipe(
    take(1),
    withLatestFrom(store.select(selectUserRole)),
    map(([isLoggedIn, role]) => {
      const normalizedRole = normalizeRole(role as string | number | null | undefined);
      if (isLoggedIn && normalizedRole === Role.Customer) {
        return true;
      }
      if (isLoggedIn && normalizedRole === Role.Admin) {
        return router.createUrlTree(['/admin/dashboard']);
      }
      if (isLoggedIn && normalizedRole === Role.Vendor) {
        return router.createUrlTree(['/vendor/dashboard']);
      }

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    })
  );
};
