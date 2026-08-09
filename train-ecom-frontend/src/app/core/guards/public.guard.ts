import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectUserRole } from '../store/auth/auth.selectors';
import { map, take, withLatestFrom } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsLoggedIn).pipe(
    take(1),
    withLatestFrom(store.select(selectUserRole)),
    map(([isLoggedIn, role]) => {
      if (isLoggedIn && role) {
        return role === 'Admin'
          ? router.createUrlTree(['/admin/dashboard'])
          : router.createUrlTree(['/']);
      }
      return true;
    }),
  );
};
