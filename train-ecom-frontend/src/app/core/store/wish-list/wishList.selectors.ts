import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WishlistState } from './wishList.reducer';


export const selectWishListState = createFeatureSelector<WishlistState>('wishlist');

export const selectWishlistItems = createSelector(
    selectWishListState,
    (wishlistState) => wishlistState.items
);

export const selectWishlistLoading = createSelector(
    selectWishListState,
    (wishlistState) => wishlistState.loading
);

export const selectWishlistLoaded = createSelector(
    selectWishListState,
    (wishlistState) => wishlistState.loaded
);

export const selectWishlistCount = createSelector(
    selectWishlistItems,
    (wishlistItems) => wishlistItems.length
);

export const selectWishlistError = createSelector(
    selectWishListState,
    (wishlistState) => wishlistState.error
);