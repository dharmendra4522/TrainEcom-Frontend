import { createAction, props } from '@ngrx/store';
import { UserProfile } from '../../models/user.model';

export const loadProfileReq = createAction(
    '[User] Load Profile Request',
);

export const loadProfileSuccess = createAction(
    '[User] Load Profile Success',
    props<{ profile: UserProfile }>()
);

export const loadProfileFailure = createAction(
    '[User] Load Profile Failure',
    props<{ error: string }>()
)