import { createReducer, on } from "@ngrx/store";
import { UserState, UserProfile } from "../../models/user.model";
import * as UserActions from './user.actions';

export const initialUserState: UserState = {
    profile: null,
    isLoading: false,
    error: null
}

export const userReducer = createReducer(
    initialUserState,
    on(UserActions.loadProfileReq, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(UserActions.loadProfileSuccess, (state, { profile }) => ({
        ...state,
        profile: profile,
        isLoading: false,
        error: null
    })),

    on(UserActions.loadProfileFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error: error
    }))
)

