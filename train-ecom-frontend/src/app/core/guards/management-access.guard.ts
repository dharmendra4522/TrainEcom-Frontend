import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import {
  FEATURE_ACCESS,
  PORTAL_ACCESS,
  isManagementFeature,
  isPortalKey,
} from '../config/management-access.config';
import { selectUserRole } from '../store/auth/auth.selectors';
import { Role } from '../models/auth.model';

export const portalAccessGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);
  const portal = route.data?.['portal'];

  if (!isPortalKey(portal)) return router.createUrlTree(['/']);

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) =>
      !!role && PORTAL_ACCESS[portal].includes(role as Role)
        ? true
        : router.createUrlTree(['/']),
    ),
  );
};

export const managementAccessGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const portal = state.url.split('?')[0].split('/').filter(Boolean)[0];
  const feature = route.data?.['feature'];

  if (!isPortalKey(portal) || !isManagementFeature(feature)) {
    return router.createUrlTree(['/']);
  }

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) =>
      !!role && FEATURE_ACCESS[portal][feature].includes(role as Role)
        ? true
        : router.createUrlTree(['/']),
    ),
  );
};
