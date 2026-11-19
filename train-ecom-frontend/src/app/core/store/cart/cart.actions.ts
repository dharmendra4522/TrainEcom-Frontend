import { createAction, props } from '@ngrx/store';
import { CartResponse, CartItem, CartProductDetails } from '../../models/cart.model';

export const loadCart = createAction(
  '[Cart] Load Cart',
  (props?: { force?: boolean }) => props || {}
);

export const loadCartSuccess = createAction(
  '[Cart] Load Cart Success',
  props<{ cart: CartResponse }>()
);

export const loadCartFailure = createAction(
  '[Cart] Load Cart Failure',
  props<{ error: string }>()
);


export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ productId: number; quantity: number; productDetails?: CartProductDetails }>()
);

export const addToCartSuccess = createAction(
  '[Cart] Add To Cart Success',
  props<{ cart: CartResponse }>()
);



export const addToCartFailure = createAction(
  '[Cart] Add To Cart Failure',
  props<{ error: string }>()
);



export const updateCartItem = createAction(
  '[Cart] Update Cart Item',
  props<{ itemId: number; quantity: number }>()
);


export const updateCartItemSuccess = createAction(
  '[Cart] Update Cart Item Success',
  props<{ cart: CartResponse }>()
);


export const updateCartItemFailure = createAction(
  '[Cart] Update Cart Item Failure',
  props<{ error: string }>()
);


export const deleteCartItem = createAction(
  '[Cart] Delete Cart Item',
  props<{ itemId: number }>()
);


export const deleteCartItemSuccess = createAction(
  '[Cart] Delete Cart Item Success',
  props<{ cart: CartResponse }>()
);


export const deleteCartItemFailure = createAction(
  '[Cart] Delete Cart Item Failure',
  props<{ error: string }>()
);



export const clearCart = createAction('[Cart] Clear Cart');
export const clearCartSuccess = createAction(
  '[Cart] Clear Cart Success',
  props<{ cart: CartResponse }>()
);



export const clearCartFailure = createAction(
  '[Cart] Clear Cart Failure',
  props<{ error: string }>()
);


export const mergeCart = createAction(
  '[Cart] Merge Cart',
  props<{ cartItems: CartItem[] }>()
);


export const mergeCartSuccess = createAction(
  '[Cart] Merge Cart Success',
  props<{ cart: CartResponse }>()
);


export const mergeCartFailure = createAction(
  '[Cart] Merge Cart Failure',
  props<{ error: string }>()
);
