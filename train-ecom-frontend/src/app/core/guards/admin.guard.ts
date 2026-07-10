import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/internal/operators/take';
import { selectUserRole } from '../store/auth/auth.selectors';
import { map } from 'rxjs/internal/operators/map';

export const adminGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (role === 'Admin') {
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  )
};
