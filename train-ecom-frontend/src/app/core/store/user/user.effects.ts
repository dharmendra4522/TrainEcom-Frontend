import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserService } from "../../services/user.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as UserActions from './user.actions';
import { exhaustMap, map, catchError, of } from "rxjs";
import { NotificationService } from "../../services/notification.service";




@Injectable()

export class UserEffects {
    private actions$ = inject(Actions);
    private userService = inject(UserService);
    private notification = inject(NotificationService);


    loadProfile$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(UserActions.loadProfileReq),
            exhaustMap(() =>
                this.userService.getUserProfile().pipe(
                    map((profile) => (

                        UserActions.loadProfileSuccess({ profile })),
                    ),
                    catchError((error) => {
                        const errorMsg = error?.error?.message || error?.message || 'Failed to load profile';
                        this.notification.showError(errorMsg);
                        return of(UserActions.loadProfileFailure({ error: errorMsg }));
                    })
                )
            )
        );
    });

}