import { createAction, props } from '@ngrx/store';
import { WishListItem } from '../../models/wishList.model';


// actions for loading wishlist
export const loadWishlist = createAction(
    '[Wishlist] Load Wishlist'
)

export const loadWishlistSuccess = createAction(
    '[Wishlist] Load Wishlist Success',
    props<{ items: WishListItem[] }>()
)

export const loadWishlistFailure = createAction(
    '[Wishlist] Load Wishlist Failure',
    props<{ error: string }>()
)


// actions for adding to wishlist
export const addToWishlist = createAction(
    `[Wishlist] Add To Wishlist`,
    props<{ productId: number }>()
)

export const addToWishlistSuccess = createAction(
    `[Wishlist] Add To Wishlist Success`,
    props<{ productId: number }>()
)

export const addToWishlistFailure = createAction(
    `[Wishlist] Add To Wishlist Failure`,
    props<{ error: string }>()
)


// actions for removing from wishlist

export const removeFromWishlist = createAction(
    `[Wishlist] Remove From Wishlist`,
    props<{ productId: number }>()
)

export const removeFromWishlistSuccess = createAction(
    `[Wishlist] Remove From Wishlist Success`,
    props<{ productId: number }>()
)

export const removeFromWishlistFailure = createAction(
    `[Wishlist] Remove From Wishlist Failure`,
    props<{ error: string }>()
)