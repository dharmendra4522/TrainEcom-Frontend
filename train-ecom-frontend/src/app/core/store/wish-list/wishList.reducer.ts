import { WishListItem } from '../../models/wishList.model';
import { createReducer, on } from '@ngrx/store';
import * as WishlistActions from './wishList.actions';


export interface WishlistState {
    items: WishListItem[];
    loading: boolean;
    error: unknown;
}

export const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null
};

export const wishlistReducer = createReducer(
    initialState,

    on(WishlistActions.loadWishlist, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(WishlistActions.loadWishlistSuccess, (state, { items }) => ({
        ...state,
        items: items,
        loading: false,
        error: null
    })),

    on(WishlistActions.loadWishlistFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    })),

    on(WishlistActions.addToWishlist, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(WishlistActions.addToWishlistSuccess, (state) => ({
        ...state,
        loading: false
    })),
    on(WishlistActions.addToWishlistFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    })),

    on(WishlistActions.removeFromWishlist, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(WishlistActions.removeFromWishlistSuccess, (state) => ({
        ...state,
        loading: false
    })),
    on(WishlistActions.removeFromWishlistFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    }))

);