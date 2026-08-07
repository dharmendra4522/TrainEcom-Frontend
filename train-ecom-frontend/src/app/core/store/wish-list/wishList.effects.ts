import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { NotificationService } from "../../services/notification.service";
import { WishListService } from "../../services/wish-list.service";
import * as WishlistActions from './wishList.actions';
import { map, catchError, of, exhaustMap, mergeMap, withLatestFrom, switchMap } from 'rxjs';
import { selectWishlistLoaded, selectWishlistItems } from "./wishList.selectors";

@Injectable()
export class WishlistEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private notification = inject(NotificationService);
    private wishlistService = inject(WishListService);


    loadWishlist$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(WishlistActions.loadWishlist),
            withLatestFrom(
                this.store.select(selectWishlistLoaded),
                this.store.select(selectWishlistItems)
            ),
            exhaustMap(([_, loaded, items]) => {
                if (loaded) {
                    return of(WishlistActions.loadWishlistSuccess({ items }));
                }
                return this.wishlistService.getWishList().pipe(
                    map((wishlistItems) => {
                        return WishlistActions.loadWishlistSuccess({ items: wishlistItems });
                    }),
                    catchError((error) => {
                        const errorMsg = error?.error?.message || error?.message || 'Failed to load wishlist';
                        this.notification.showError(errorMsg);
                        return of(WishlistActions.loadWishlistFailure({ error: errorMsg }));
                    })
                );
            })
        );
    });

    addToWishlist$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(WishlistActions.addToWishlist),
            mergeMap((action) => {
                return this.wishlistService.addToWishlist(action.productId).pipe(
                    map(() => {
                        this.notification.showSuccess('Item added to wishlist', 'Close');
                        return WishlistActions.addToWishlistSuccess({ productId: action.productId });
                    }),
                    catchError((error) => {
                        const errorMsg = error?.error?.message || error?.message || 'Failed to add item to wishlist';
                        this.notification.showError(errorMsg);
                        return of(WishlistActions.addToWishlistFailure({ error: errorMsg }));
                    })
                )
            })
        )
    });

    removeFromWishlist$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(WishlistActions.removeFromWishlist),
            mergeMap((action) => {
                return this.wishlistService.removeFromWishlist(action.productId).pipe(
                    map(() => {
                        this.notification.showSuccess('Item removed from wishlist', 'Close');
                        return WishlistActions.removeFromWishlistSuccess({ productId: action.productId });
                    }),
                    catchError((error) => {
                        const errorMsg = error?.error?.message || error?.message || 'Failed to remove item from wishlist';
                        this.notification.showError(errorMsg);
                        return of(WishlistActions.removeFromWishlistFailure({ error: errorMsg }));
                    })
                )
            })
        )
    });

    refreshWishlist$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(WishlistActions.addToWishlistSuccess),
            mergeMap(() => this.wishlistService.getWishList().pipe(
                map((wishlistItems) => WishlistActions.loadWishlistSuccess({ items: wishlistItems })),
                catchError(() => of(WishlistActions.loadWishlistFailure({ error: 'Failed to refresh wishlist' })))
            ))
        );
    });
}