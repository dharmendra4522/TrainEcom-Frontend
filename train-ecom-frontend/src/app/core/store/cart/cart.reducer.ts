import { CartItem, CartResponse } from '../../models/cart.model';
import { createAction, props, createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const initialCartState: CartState = {
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  loading: false,
  loaded: false,
  error: null,
};

const calculateTotalQuantity = (items: CartItem[]): number => {
  return (items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
};

const calculateTotalAmount = (items: CartItem[]): number => {
  return (items || []).reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
};

export const cartReducer = createReducer(
  initialCartState,
  on(CartActions.loadCart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CartActions.loadCartSuccess, (state, { cart }) => {
    const items = cart.items || [];
    return {
      ...state,
      items: items,
      totalQuantity: cart.totalQuantity !== undefined && cart.totalQuantity !== null ? cart.totalQuantity : calculateTotalQuantity(items),
      totalAmount: cart.totalAmount !== undefined && cart.totalAmount !== null ? cart.totalAmount : calculateTotalAmount(items),
      loading: false,
      loaded: true,
      error: null,
    };
  }),


  on(CartActions.loadCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: error,
  })),

  
  on(CartActions.addToCart, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(CartActions.addToCartSuccess, (state, { cart }) => {
    const items = cart.items || [];
    return {
      ...state,
      items: items,
      totalQuantity: cart.totalQuantity !== undefined && cart.totalQuantity !== null ? cart.totalQuantity : calculateTotalQuantity(items),
      totalAmount: cart.totalAmount !== undefined && cart.totalAmount !== null ? cart.totalAmount : calculateTotalAmount(items),
      loading: false,
      error: null,
    };
  }),


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


  on(CartActions.updateCartItemSuccess, (state, { cart }) => {
    const items = cart.items || [];
    return {
      ...state,
      items: items,
      totalQuantity: cart.totalQuantity !== undefined && cart.totalQuantity !== null ? cart.totalQuantity : calculateTotalQuantity(items),
      totalAmount: cart.totalAmount !== undefined && cart.totalAmount !== null ? cart.totalAmount : calculateTotalAmount(items),
      loading: false,
      error: null,
    };
  }),


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


  on(CartActions.deleteCartItemSuccess, (state, { cart }) => {
    const items = cart.items || [];
    return {
      ...state,
      items: items,
      totalQuantity: cart.totalQuantity !== undefined && cart.totalQuantity !== null ? cart.totalQuantity : calculateTotalQuantity(items),
      totalAmount: cart.totalAmount !== undefined && cart.totalAmount !== null ? cart.totalAmount : calculateTotalAmount(items),
      loading: false,
      error: null,
    };
  }),


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


  on(CartActions.mergeCartSuccess, (state, { cart }) => {
    const items = cart.items || [];
    return {
      ...state,
      items: items,
      totalQuantity: cart.totalQuantity !== undefined && cart.totalQuantity !== null ? cart.totalQuantity : calculateTotalQuantity(items),
      totalAmount: cart.totalAmount !== undefined && cart.totalAmount !== null ? cart.totalAmount : calculateTotalAmount(items),
      loading: false,
      error: null,
    };
  }),

  
  on(CartActions.mergeCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error,
  })),
);
