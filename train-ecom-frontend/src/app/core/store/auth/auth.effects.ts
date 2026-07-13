import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '../../models/app.model';

@Injectable()
export class AuthEffects {
    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    login$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.loginReq),
        exhaustMap(action => this.authService.login(action.request).pipe(
            map(res => {
                const roleString = this.decodeRole(res.accessToken);

                const role = roleString as Role | null;

                localStorage.setItem('accessToken', res.accessToken);
                return AuthActions.loginSuccess({ payload: { token: res.accessToken, role } });
            }),
            catchError(err => of(AuthActions.loginFailure({ error: err.message || 'Login Failed' })))
        ))
    ));


    loginSuccess$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ payload, isRefresh }) => {
            if(isRefresh) {
                return;
            }
            const role = payload.role ? payload.role.toString().toLowerCase() : '';
            const route = role === 'admin' ? '/admin/dashboard' : '/';
            this.router.navigate([route]);
        })
    ), { dispatch: false });



    loginFailure$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(action => this.showToast(action.error || 'Login Failed', 'snackbar-error'))
    ), { dispatch: false });



    logout$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
            localStorage.removeItem('accessToken');
            this.router.navigate(['/login']);
        })
    ), { dispatch: false });



    register$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.registerReq),
        exhaustMap(action => this.authService.register(action.request).pipe(
            map(response => {
                this.showToast('Registration Successful!', 'snackbar-success');
                this.router.navigate(['/login']);
                return AuthActions.registerSuccess({ response });
            }),
            catchError(err => {
                this.showToast(err.message || 'Registration Failed', 'snackbar-error');
                return of(AuthActions.registerFailure({ error: err.message }));
            })
        ))
    ));


    private decodeRole(token: string): Role | null {
        try {
            const decoded: any = jwtDecode(token);
            const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

            const rawRole = decoded[roleKey];
            console.log('Decoded Raw Role:', rawRole);
            return rawRole ? (rawRole as Role) : null;
        } catch (error) {
            console.error('Token decoding failed:', error);
            return null;
        }
    }

    private showToast(msg: string, panelClass: string) {
        this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: [panelClass] });
    }
}