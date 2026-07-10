import { loginRequest, loginResponse, registerRequest, registerResponse } from "../../models/auth.model";
import { createAction, props } from "@ngrx/store";

export const loginReq = createAction(
    '[Auth API] Login Request',
    props<{ request: loginRequest }>()
);

export const loginSuccess = createAction(
    '[Auth API] Login Success',
    props<{ response: loginResponse }>()
);

export const loginFailure = createAction(
    '[Auth API] Login Failure',
    props<{ error: string }>()
);

export const logout = createAction(
    '[Auth API] Logout'
);


export const registerReq = createAction(
    '[Auth API] Register Request',
    props<{ request: registerRequest }>()
);

export const registerSuccess = createAction(
    '[Auth API] Register Success',
    props<{ response: registerResponse }>()
)

export const registerFailure = createAction(
    '[Auth API] Register Failure',
    props<{ error: string }>()
)