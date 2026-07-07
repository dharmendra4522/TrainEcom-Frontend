import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {

    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);

    login$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(AuthActions.loginReq),

            exhaustMap((action) =>
                this.authService.login(action.request).pipe(

                    map((response) => AuthActions.loginSuccess({ response })),

                    catchError((error) => of(AuthActions.loginFailure({ error: error.message || 'Login Failed' })))
                )
            )
        );
    });

    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap((action) => {
                localStorage.setItem('accessToken', action.response.access_token);
                this.router.navigate(['/']);
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
                console.log('Registration Successful! Redirecting to login...');
                this.router.navigate(['/login']);
            })
        ),
        { dispatch: false }
    );

    registerFailure$ = createEffect(() =>

        this.actions$.pipe(
            ofType(AuthActions.registerFailure),
            tap((action) => {
                console.error('Registration Failed:', action.error);
            })
        ),
        { dispatch: false }
    )

}