import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import * as UserActions from '../user/user.actions';
import { catchError, map, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LoginResponse, Role } from '../../models/auth.model';
import { UserSessionPayload } from '../../models/auth.model';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';

import { extractBackendMessage } from '../../utils/error.utils';
import { ApprovalStatus } from '../../models/user.model';
import { normalizeApprovalStatus, normalizeRole } from '../../utils/role.utils';

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
            const role = this.decodeRole(res.accessToken) ?? (normalizeRole(res.role) || null);
            const vendorStatus =
              role === Role.Vendor
                ? ((res.status ?? res.approvalStatus) as ApprovalStatus) || null
                : null;

            const TIMER_DURATION = 5 * 60 * 1000;
            const calculatedExpireTime = (
              new Date().getTime() + TIMER_DURATION
            ).toString();

            localStorage.setItem('accessToken', res.accessToken);

            if (vendorStatus) {
              localStorage.setItem('vendorStatus', String(vendorStatus));
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
                status: normalizeApprovalStatus(res.status) ?? undefined,
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
            if (isRefresh) {
              return;
            }

            this.store.dispatch(UserActions.loadProfileReq());

            const role = normalizeRole(payload.role);
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

      const rawRole = decoded[roleKey] ?? decoded['role'] ?? decoded['Role'];
      const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;
      return normalizeRole(role as string | number | null | undefined);
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  private getPostLoginRoute(role: Role | null): string {
    let fallbackRoute = '/';
    if (role === Role.Admin) {
      fallbackRoute = '/admin/dashboard';
    } else if (role === Role.Vendor) {
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

    if (role === Role.Admin) {
      return returnUrl.startsWith('/admin') ? returnUrl : fallbackRoute;
    }
    if (role === Role.Vendor) {
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

