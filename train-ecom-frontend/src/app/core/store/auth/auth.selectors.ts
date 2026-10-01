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

export const selectUserRole = createSelector(
    selectAuthState,
    (state: AuthState) => state.userRole
)

export const selectAuthError = createSelector(
    selectAuthState,
    (state: AuthState) => state.error
);


export const selectSubmittedDate = createSelector(
    selectAuthState,
    (state: AuthState) => state.submittedDate
);

export const selectRegistrationId = createSelector(
    selectAuthState,
    (state: AuthState) => state.registrationId
);

export const selectAuthStatus = createSelector(
    selectAuthState,
    (state: AuthState) => state.status
);