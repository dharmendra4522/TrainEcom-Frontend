import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../../models/user.model';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUserProfile = createSelector(
    selectUserState,
    (state: UserState) => state.profile
)

export const selectUserIsLoading = createSelector(
    selectUserState,
    (state: UserState) => state.isLoading
)

export const selectUserError = createSelector(
    selectUserState,
    (state: UserState) => state.error
)