import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { state } from '@angular/animations';

export interface AuthState {
    isLoggedIn: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    error: string | null;
}

export const initialAuthState: AuthState = {
    isLoggedIn: false,
    accessToken: null,
    refreshToken: null,
    error: null,
}

export const authReducer = createReducer(
    initialAuthState,

    // for successful login
    on(AuthActions.loginSuccess, (state, { response }) => ({
        ...state,
        isLoggedIn: true,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        error: null,
    })),

    on(AuthActions.loginFailure, (state, {error}) => ({
        ...state,
        isLoggedIn: false,
        accessToken: null,
        refreshToken: null,
        error: error,
    })),

    on(AuthActions.logout, (state) =>({
        ...initialAuthState
    }))
)