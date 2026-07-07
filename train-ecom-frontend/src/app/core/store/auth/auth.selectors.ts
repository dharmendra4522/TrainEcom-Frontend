import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');


export const selectIsLoggedIn = createSelector(
    selectAuthState,
    (state: AuthState) => state.isLoggedIn
    
);

export const selectAccessToken = createSelector(
    selectAuthState,
    (state: AuthState) => state.accessToken
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
);