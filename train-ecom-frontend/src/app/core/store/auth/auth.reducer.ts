import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { state } from '@angular/animations';

export interface AuthState {
    isLoggedIn: boolean;
    accessToken: string | null;
    userRole: string | null;
    error: string | null;
}

export const initialAuthState: AuthState = {
    isLoggedIn: false,
    accessToken: null,
    userRole: null,
    error: null,
}

export const authReducer = createReducer(
    initialAuthState,

    // for successful login
    on(AuthActions.loginSuccess, (state, { payload }) => ({
        ...state,
        isLoggedIn: true,
        accessToken: payload.token,
        userRole: payload.role,
        error: null,
    })),

    on(AuthActions.loginFailure, (state, {error}) => ({
        ...state,
        isLoggedIn: false,
        accessToken: null,
        userRole: null,
        error: error,
    })),

    on(AuthActions.logout, (state) =>({
        ...initialAuthState
    }))
)