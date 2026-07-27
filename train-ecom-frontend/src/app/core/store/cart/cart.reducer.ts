import { CartItem, CartResponse } from '../../models/cart.model';
import { createAction, props, createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

export const initialCartState: CartState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  loading: false,
  error: null,
};

export const cartReducer = createReducer(
  initialCartState,
  on(CartActions.loadCart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CartActions.loadCartSuccess, (state, { cart }) => ({
    ...state,
    items: cart.items,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    loading: false,
    error: null,
  })),
  on(CartActions.loadCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
  on(CartActions.addToCart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CartActions.addToCartSuccess, (state, { cart }) => ({
    ...state,
    items: cart.items,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    loading: false,
    error: null,
  })),
  on(CartActions.addToCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
  on(CartActions.updateCartItem, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CartActions.updateCartItemSuccess, (state, { cart }) => ({
    ...state,
    items: cart.items,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    loading: false,
    error: null,
  })),
  on(CartActions.updateCartItemFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
  on(CartActions.deleteCartItem, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CartActions.deleteCartItemSuccess, (state, { cart }) => ({
    ...state,
    items: cart.items,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    loading: false,
    error: null,
  })),
  on(CartActions.deleteCartItemFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
  on(CartActions.clearCart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CartActions.clearCartSuccess, (state) => ({
    ...state,
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    loading: false,
    error: null,
  })),
  on(CartActions.clearCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
  on(CartActions.mergeCart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(CartActions.mergeCartSuccess, (state, { cart }) => ({
    ...state,
    items: cart.items,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    loading: false,
    error: null,
  })),
  on(CartActions.mergeCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
);
