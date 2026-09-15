import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { state } from '@angular/animations';
import { ApprovalStatus } from '../../models/user.model';

export interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  userRole: string | null;
  isBussinessDetailsCompleted: boolean | null;
  approvalStatus: ApprovalStatus | null;
  pendingTimerExpiresAt: number | null;

  error: string | null;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  accessToken: null,
  userRole: null,
  isBussinessDetailsCompleted: null,
  approvalStatus: null,
  pendingTimerExpiresAt: null,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,

  // for successful login
  on(AuthActions.loginSuccess, (state, { payload }) => ({
    ...state,
    isLoggedIn: true,
    accessToken: payload.token,
    userRole: payload.role,
    isBussinessDetailsCompleted: payload.isBussinessDetailsCompleted ?? null,
    approvalStatus: (payload.approvalStatus as ApprovalStatus) ?? null,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoggedIn: false,
    accessToken: null,
    userRole: null,
    error: error,
  })),

  on(AuthActions.logout, (state) => ({
    ...initialAuthState,
  })),
);
