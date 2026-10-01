import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectUserRole } from '../store/auth/auth.selectors';
import { Role } from '../models/auth.model';
import { normalizeRole } from '../utils/role.utils';

export const guestOrCustomerGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {

      const normalizedRole = normalizeRole(role as string | number | null | undefined);

      if (normalizedRole === Role.Admin) {
        return router.createUrlTree(['/admin/dashboard']);
      }

      if (normalizedRole === Role.Vendor) {
        return router.createUrlTree(['/vendor/dashboard']);
      }

      return true; 
    }),
  );
};
