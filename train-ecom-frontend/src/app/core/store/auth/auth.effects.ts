import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store'; // 🔹 Store import kiya
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import * as UserActions from '../user/user.actions'; // 🔹 User Actions import kiya
import { catchError, map, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Role } from '../../models/app.model';
import { BackendError } from '../../models/auth.model';
import { NotificationService } from '../../services/notification.service';
import { CartService } from '../../services/cart.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private store = inject(Store); 
  private cartService = inject(CartService);


  private getErrorMessage(err: BackendError, isLogin: boolean = true): string {
    const rawMessage =
      (typeof err === 'string' ? err : err?.error?.message || err?.message) ||
      'An error occurred';

    if (rawMessage.includes('0 Unknown Error')) {
      return 'Unable to connect to the server. Please try again later.';
    }

    const lowerMsg = rawMessage.toLowerCase();

    if (lowerMsg.includes('unauthorized') || lowerMsg.includes('invalid')) {
      return 'Incorrect Email or Password. Please check your details.';
    }
    if (lowerMsg.includes('not found')) {
      return 'Account does not exist. Please register first.';
    }
    if (lowerMsg.includes('exists') || lowerMsg.includes('duplicate')) {
      return 'An account with this email already exists.';
    }

    return rawMessage.length > 50
      ? 'Something went wrong. Please try again.'
      : rawMessage;
  }

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginReq),
      exhaustMap((action) =>
        this.authService.login(action.request).pipe(
          map((res) => {
            const roleString = this.decodeRole(res.accessToken);
            const role = roleString as Role | null;

            localStorage.setItem('accessToken', res.accessToken);
            return AuthActions.loginSuccess({
              payload: { token: res.accessToken, role },
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
        tap(({ payload, isRefresh }: any) => {
          if (isRefresh) {
            return;
          }

          this.store.dispatch(UserActions.loadProfileReq());

          this.cartService.loadCart(); 

          const role = payload.role
            ? payload.role.toString().toLowerCase()
            : '';
          const route = role === 'admin' ? '/admin/dashboard' : '/';
          this.router.navigate([route]);
        }),
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
      const decoded: any = jwtDecode(token);
      const roleKey =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

      const rawRole = decoded[roleKey];
      console.log('Decoded Raw Role:', rawRole);
      return rawRole ? (rawRole as Role) : null;
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  }

  private showToast(msg: string, panelClass: string) {
    this.notification.showError(msg);
  }
}