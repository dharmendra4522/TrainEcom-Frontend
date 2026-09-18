import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../store/auth/auth.selectors';
import { map, take } from 'rxjs';
import { Role } from '../models/auth.model';

export const vendorGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (role === Role.Vendor) {
        return true;
      }
      router.navigate(['/']);
      return false;
    }),
  );
};
