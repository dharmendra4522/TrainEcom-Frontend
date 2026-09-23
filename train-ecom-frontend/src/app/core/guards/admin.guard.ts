import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/internal/operators/take';
import { selectUserRole } from '../store/auth/auth.selectors';
import { map } from 'rxjs/internal/operators/map';
import { Role, normalizeRole } from '../models/auth.model';

export const adminGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      const normalizedRole = normalizeRole(role as string | number | null | undefined);
      if (normalizedRole === Role.Admin) {
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  )
};
