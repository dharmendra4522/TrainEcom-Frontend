import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store'; // 🔹 Store import kiya
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import * as UserActions from '../user/user.actions'; // User Actions import kiya
import { catchError, map, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, Role } from '../../models/auth.model';
import { BackendError, UserSessionPayload } from '../../models/auth.model';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';

import { extractBackendMessage } from '../../utils/error.utils';
import { ApprovalStatus } from '../../models/user.model';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private store = inject(Store);
  private userService = inject(UserService);

  private getErrorMessage(err: unknown, isLogin: boolean = true): string {
    return extractBackendMessage(err, 'An error occurred');
  }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginReq),
      exhaustMap((action) =>
        this.authService.login(action.request).pipe(
          map((res: LoginResponse) => {
            const roleString = this.decodeRole(res.accessToken);

            const role = roleString as Role | null;
            const vendorStatus =
              role === Role.Vendor
                ? (res.status as ApprovalStatus) || null
                : null;

            const TIMER_DURATION = 5 * 60 * 1000;
            const calculatedExpireTime = (
              new Date().getTime() + TIMER_DURATION
            ).toString();

            localStorage.setItem('accessToken', res.accessToken);

            if (vendorStatus) {
              localStorage.setItem('vendorStatus', vendorStatus);
            } else {
              localStorage.removeItem('vendorStatus');
            }
            if (res.registrationId)
              localStorage.setItem('registrationId', res.registrationId);
            if (res.submittedDate)
              localStorage.setItem('submittedDate', res.submittedDate);
            localStorage.setItem('vendor_session_expiry', calculatedExpireTime);
            return AuthActions.loginSuccess({
              payload: {
                token: res.accessToken,
                role,
                approvalStatus: vendorStatus ?? undefined,
                submittedDate: res.submittedDate,
                registrationId: res.registrationId,
                status: res.status,
              },
            });
          }),
          catchError((err) => {
            const cleanError = this.getErrorMessage(err, true);
            return of(AuthActions.loginFailure({ error: cleanError }));
          }),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(
          ({
            payload,
            isRefresh,
          }: {
            payload: UserSessionPayload;
            isRefresh?: boolean;
          }) => {
            // Session restoration only rehydrates state; it must not redirect or
            // duplicate the profile request. Cart hydration is handled by CartEffects.
            if (isRefresh) {
              return;
            }

            this.store.dispatch(UserActions.loadProfileReq());

            const role = payload.role
              ? payload.role.toString().toLowerCase()
              : '';

            this.router.navigateByUrl(this.getPostLoginRoute(role));
          },
        ),
      ),
    { dispatch: false },
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap((action) =>
          this.showToast(action.error || 'Login Failed', 'snackbar-error'),
        ),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('vendorStatus');
          localStorage.removeItem('vendor_session_expiry');
          localStorage.removeItem('registrationId');
          localStorage.removeItem('submittedDate');
          this.userService.clearCache();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerReq),
      exhaustMap((action) =>
        this.authService.register(action.request).pipe(
          map((response) => {
            this.showToast('Registration Successful!', 'snackbar-success');
            this.router.navigate(['/login']);
            return AuthActions.registerSuccess({ response });
          }),
          catchError((err) => {
            const cleanError = this.getErrorMessage(err, false);
            this.showToast(cleanError, 'snackbar-error');
            return of(AuthActions.registerFailure({ error: cleanError }));
          }),
        ),
      ),
    ),
  );

  private decodeRole(token: string): Role | null {
    try {
      const decoded = jwtDecode<Record<string, unknown>>(token);
      const roleKey =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

      const rawRole = decoded[roleKey];
      const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;
      console.log('Decoded Raw Role:', role);
      return typeof role === 'string' ? (role as Role) : null;
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  private getPostLoginRoute(role: string): string {
    let fallbackRoute = '/';
    if (role === 'admin') {
      fallbackRoute = '/admin/dashboard';
    }
    else if (role === 'vendor') {
      fallbackRoute = '/vendor/dashboard';
    }
    const returnUrl = this.router.parseUrl(this.router.url).queryParams[
      'returnUrl'
    ];

    if (
      typeof returnUrl !== 'string' ||
      !returnUrl.startsWith('/') ||
      returnUrl.startsWith('//')
    ) {
      return fallbackRoute;
    }

    if (role === 'admin') {
      return returnUrl.startsWith('/admin') ? returnUrl : fallbackRoute;
    }
    if (role === 'vendor') {
      return returnUrl.startsWith('/vendor') ? returnUrl : fallbackRoute;
    }

    return returnUrl.startsWith('/admin') ? fallbackRoute : returnUrl;
  }

  private showToast(msg: string, panelClass: string) {
    if (panelClass === 'snackbar-success') {
      this.notification.showSuccess(msg);
    } else if (panelClass === 'snackbar-info') {
      this.notification.showInfo(msg);
    } else {
      this.notification.showError(msg);
    }
  }
}
