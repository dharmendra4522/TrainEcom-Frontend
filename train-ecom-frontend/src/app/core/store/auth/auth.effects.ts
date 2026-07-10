import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthEffects {

    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);



    login$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.loginReq),
            exhaustMap((action) =>
                this.authService.login(action.request).pipe(
                    map((response) => {
                        console.log('[AuthEffects] Login API response received:', response);

                        const token = response.accessToken;
                        let role = null;
                        console.log('[AuthEffects] Access token received:', token);

                        try {

                            const decoded: any = jwtDecode(token);
                            console.log('[AuthEffects] Decoded JWT payload:', decoded);

                            const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
                            role = decoded[roleKey] || decoded.role || decoded.Role || null;
                            console.log('[AuthEffects] Role decoded from JWT:', role);
                        } catch (error) {
                            console.error('[AuthEffects] Token decoding failed:', error);
                        }

                        console.log('[AuthEffects] Dispatching loginSuccess with payload:', { token, role });
                        return AuthActions.loginSuccess({ payload: { token, role } });
                    }),
                    catchError((error) => of(AuthActions.loginFailure({ error: error.message || 'Login Failed' })))
                )
            )
        );
    });


    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap((action) => {
                console.log('[AuthEffects] loginSuccess action received:', action);
                console.log('[AuthEffects] Saving access token to localStorage.');
                localStorage.setItem('accessToken', action.payload.token);
                console.log('[AuthEffects] Token saved. Decoded role for routing:', action.payload.role);

                this.snackBar.open('Welcome back! Login Successful.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    panelClass: ['snackbar-success']
                });

                if (action.payload.role === 'Admin') {
                    console.log('[AuthEffects] Role is Admin. Navigating to /admin/dashboard.');
                    this.router.navigate(['/admin/dashboard']).then(
                        (navigated) => console.log('[AuthEffects] Admin navigation completed:', navigated),
                        (error) => console.error('[AuthEffects] Admin navigation failed:', error)
                    );
                } else if (action.payload.role === 'Customer') {
                    console.log('[AuthEffects] Role is Customer. Navigating to /.');
                    this.router.navigate(['/']).then(
                        (navigated) => console.log('[AuthEffects] Customer navigation completed:', navigated),
                        (error) => console.error('[AuthEffects] Customer navigation failed:', error)
                    );
                } else {
                    console.warn('[AuthEffects] No route configured for role:', action.payload.role);
                }
            })
        ),
        { dispatch: false }
    );


    loginFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginFailure),
            tap((action) => {
                this.snackBar.open(action.error || 'Invalid Email/Password or Server Error!', 'Close', {
                    duration: 4000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    panelClass: ['snackbar-error']
                });
                console.error('[AuthEffects] Login Failed:', action.error);
            })
        ),
        { dispatch: false }
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            tap(() => {
                localStorage.removeItem('accessToken');
                this.router.navigate(['/login']);
            })
        ),
        { dispatch: false }
    );

    register$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.registerReq),
            exhaustMap((action) =>
                this.authService.register(action.request).pipe(
                    map((response) => AuthActions.registerSuccess({ response })),
                    catchError((error) => of(AuthActions.registerFailure({ error: error.message || 'Registration Failed' })))
                )
            )
        );
    });

    registerSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.registerSuccess),
            tap(() => {
                this.snackBar.open('Registration Successful! Please login.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-success']
                })
                this.router.navigate(['/login']);
            })
        ),
        { dispatch: false }
    );

    registerFailure$ = createEffect(() =>

        this.actions$.pipe(
            ofType(AuthActions.registerFailure),
            tap((action) => {
                this.snackBar.open(action.error || 'Server error! Please try again.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-error']
                });
                console.error('Registration Failed:', action.error);
            })
        ),
        { dispatch: false }
    )

}
