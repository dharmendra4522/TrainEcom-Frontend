import * as BrandActions from './brand.action';
import { Brand } from '../../models/brand.model';
import { createReducer, on } from '@ngrx/store';

export interface BrandState {
    brand: Brand[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
}

export const initialBrandState: BrandState = {
    brand: [],
    totalRecords: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    isLoading: false,
    error: null
}

export const brandReducer = createReducer(
    initialBrandState,

    on(BrandActions.loadBrands, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(BrandActions.loadBrandsSuccess, (state, { brands, totalRecords, pageNumber, pageSize, totalPages }) => ({
        ...state,
        isLoading: false,
        error: null,
        brand: brands,
        totalRecords: totalRecords ?? brands.length,
        pageNumber: pageNumber ?? state.pageNumber,
        pageSize: pageSize ?? state.pageSize,
        totalPages: totalPages ?? state.totalPages
    })),

    on(BrandActions.loadBrandsFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),

    on(BrandActions.loadSingleBrand, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.loadSingleBrandSuccess, (state, { brand }) => ({
        ...state,
        isLoading: false,
        error: null,
        brand: [...state.brand.filter(b => b.id !== brand.id), brand]
    })),

    on(BrandActions.loadSingleBrandFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BrandActions.createBrand, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.createBrandSuccess, (state, { brand }) => ({
        ...state,
        isLoading: false,
        error: null,
        brand: [...state.brand, brand],
        totalRecords: state.totalRecords + 1
    })),
    on(BrandActions.createBrandFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BrandActions.updateBrand, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.updateBrandSuccess, (state, { brand }) => ({
        ...state,
        isLoading: false,
        error: null,
        brand: [...state.brand.filter(b => b.id !== brand.id), brand]
    })),
    on(BrandActions.updateBrandFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BrandActions.deleteBrand, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.deleteBrandSuccess, (state, { brandId }) => ({
        ...state,
        isLoading: false,
        error: null,
        brand: state.brand.filter(b => b.id !== brandId),
        totalRecords: Math.max(0, state.totalRecords - 1)
    })),
    on(BrandActions.deleteBrandFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    }))
);