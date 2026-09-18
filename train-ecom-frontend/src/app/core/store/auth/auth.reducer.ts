import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { state } from '@angular/animations';
import { ApprovalStatus } from '../../models/user.model';
import { Role } from '../../models/auth.model';

export interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  userRole: Role | string | null;
  approvalStatus: ApprovalStatus | null;
  submittedDate: string | null;
  registrationId: string | null;
  status: string | null;
  pendingTimerExpiresAt: number | null;
  error: string | null;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  accessToken: null,
  userRole: null,
  approvalStatus: null,
  submittedDate: null,
  registrationId: null,
  status: null,
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
    approvalStatus: (payload.approvalStatus as ApprovalStatus) ?? null,
    submittedDate: payload.submittedDate ?? null, 
    registrationId: payload.registrationId ?? null,
    status: payload.status ?? null,
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
