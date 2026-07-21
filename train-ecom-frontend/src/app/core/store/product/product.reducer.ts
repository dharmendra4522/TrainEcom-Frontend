import { Product } from '../../../core/models/product.model';
import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.action';

export interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
}

export const initialProductState: ProductState = {
    products: [],
    isLoading: false,
    error: null
}

export const productReducer = createReducer(
    initialProductState,

    on(ProductActions.loadProducts, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(ProductActions.loadProductsSuccess, (state, { products }) => ({
        ...state,
        products: products,
        isLoading: false,
        error: null
    })),

    on(ProductActions.loadProductsFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error: error
    })),
    on(ProductActions.createProductSuccess, (state, { product }) => ({
        ...state,
        products: [...state.products, product],
        isLoading: false,
        error: null
    })),

    on(ProductActions.updateProductSuccess, (state, { product }) => ({
        ...state,
        products: state.products.map(p => p.id === product.id ? product : p),
        isLoading: false,
        error: null
    }))
)       