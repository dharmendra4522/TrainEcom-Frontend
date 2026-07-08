import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../store/auth/auth.selectors';
import { take } from 'rxjs/internal/operators/take';
import { map } from 'rxjs/internal/operators/map';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const store = inject(Store);
  const token = localStorage.getItem('token');

  return store.pipe(
    select(selectIsLoggedIn),
    take(1),
    map((isLoggedIn) => {
      if (isLoggedIn || token) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  )

};
