import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectUserRole } from '../store/auth/auth.selectors';

export const guestOrCustomerGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  // this guard allows access to both guests and users with the 'Customer' role. If the user is logged in as an 'Admin', they are redirected to the admin dashboard.
  return store.select(selectUserRole).pipe(
    take(1),
    map((role) =>
      role === 'Admin' ? router.createUrlTree(['/admin/dashboard']) : true,
    ),
  );
};
