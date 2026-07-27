import * as BrandActions  from './brand.action';
import { Brand } from '../../models/brand.model';
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
    })),

    on(BrandActions.loadSingleBrand, (state) =>({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.loadSingleBrandSuccess, (state, { brand }) =>({
        ...state,
        isLoading: false,
        error: null,
        brands: [...state.brands.filter(b => b.id !== brand.id), brand]
    })),

    on(BrandActions.loadSingleBrandFailure, (state, { error }) =>({
        ...state,
        isLoading: false,
        error
    })),
    on(BrandActions.createBrand, (state) =>({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.createBrandSuccess, (state, { brand }) =>({
        ...state,
        isLoading: false,
        error: null,
        brands: [...state.brands, brand]
    })),
    on(BrandActions.createBrandFailure, (state, { error }) =>({
        ...state,
        isLoading: false,
        error
    })),
    on(BrandActions.updateBrand, (state) =>({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.updateBrandSuccess, (state, { brand }) =>({
        ...state,
        isLoading: false,
        error: null,
        brands: [...state.brands.filter(b => b.id !== brand.id), brand]
    })),
    on(BrandActions.updateBrandFailure, (state, { error }) =>({
        ...state,
        isLoading: false,
        error
    })),
    on(BrandActions.deleteBrand, (state) =>({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.deleteBrandSuccess, (state, { brandId }) =>({
        ...state,
        isLoading: false,
        error: null,
        brands: state.brands.filter(b => b.id !== brandId)
    })),
    on(BrandActions.deleteBrandFailure, (state, { error }) =>({
        ...state,
        isLoading: false,
        error
    }))
);
