import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectUserRole } from '../store/auth/auth.selectors';
import { map, take, withLatestFrom } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  // this guard checks if the user is logged in. If they are logged in, it redirects them based on their role. Admins are redirected to the admin dashboard, while customers are redirected to the home page. If the user is not logged in, they are allowed to access the public route.
  return store.select(selectIsLoggedIn).pipe(
    take(1),
    withLatestFrom(store.select(selectUserRole)), // here withLatestFrom is used to combine the latest values from both observables (isLoggedIn and role) so that we can make a decision based on both pieces of information.
    map(([isLoggedIn, role]) => {
      if (isLoggedIn && role) {
        return role === 'Admin'
          ? router.createUrlTree(['/admin/dashboard'])
          : router.createUrlTree(['/']);
      }
      return true;
    })
  );
};