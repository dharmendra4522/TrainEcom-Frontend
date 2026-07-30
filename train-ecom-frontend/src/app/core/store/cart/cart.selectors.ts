import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(
    selectCartState,
    (state) => state.items || []
)

export const selectCartTotalQuantity = createSelector(
    selectCartState,
    (state) => state.totalQuantity || (state.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
)

export const selectCartTotalAmount = createSelector(
    selectCartState,
    (state) => state.totalAmount || (state.items || []).reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)), 0)
)

export const selectCartLoading = createSelector(
    selectCartState,
    (state) => state.loading || false
)

export const selectCartLoaded = createSelector(
    selectCartState,
    (state) => state.loaded || false
);

export const selectCartError = createSelector(
    selectCartState,
    (state) => state.error || null
);
