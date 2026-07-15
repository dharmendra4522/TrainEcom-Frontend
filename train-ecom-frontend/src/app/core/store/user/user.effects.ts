import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserService } from "../../services/user.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as UserActions from './user.actions';
import { exhaustMap, map, catchError, of } from "rxjs";




@Injectable()

export class UserEffects {
    private actions$ = inject(Actions);
    private userService = inject(UserService);
    private snackBar = inject(MatSnackBar);


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
                        this.snackBar.open(errorMsg, 'Close', {
                            duration: 3000, panelClass: ['snackbar-error']
                        });
                        return of(UserActions.loadProfileFailure({ error: errorMsg }));
                    })
                )
            )
        );
    });

}