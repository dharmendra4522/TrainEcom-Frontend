import * as BrandActions  from './brand.action';
import { Brand } from '../../models/product.model';
import { createReducer, on } from '@ngrx/store';

export interface BrandState {
    brands: Brand[];
    isLoading: boolean;
    error: string | null;
}

export const initialBrandState: BrandState = {
    brands: [],
    isLoading: false,
    error: null
}

export const brandReducer = createReducer(
    initialBrandState,

    on(BrandActions.loadBrands, (state) =>({
        ...state,
        isLoading: true,
        error: null
    })),

    on(BrandActions.loadBrandsSuccess,(state, { brands }) =>({
        ...state,
        isLoading: false,
        error: null,
        brands
    })),

    on(BrandActions.loadBrandsFailure, (state, { error }) =>({
        ...state,
        isLoading: false,
        error
    }))
)