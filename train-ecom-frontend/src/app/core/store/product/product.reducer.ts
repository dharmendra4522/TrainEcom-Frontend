import { Product } from '../../../core/models/product.model';
import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.action';

export interface ProductState {
    products: Product[];
    pageNumber: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
}

export const initialProductState: ProductState = {
    products: [],
    pageNumber: 1,
    totalPages: 1,
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

    on(ProductActions.loadProductsSuccess, (state, { products, totalPages = 1, pageNumber = 1 }) => ({
        ...state,
        products: pageNumber === 1 ? products : [...state.products, ...products],
        totalPages: totalPages,
        pageNumber: pageNumber,
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