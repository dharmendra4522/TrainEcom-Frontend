import * as BrandActions from './brand.action';
import { Brand } from '../../models/brand.model';
import { createReducer, on } from '@ngrx/store';

export interface BrandState {
    brand: Brand[];
    paginatedBrands: Brand[];
    pagesCache: { [key: string]: Brand[] };
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
}

export const initialBrandState: BrandState = {
    brand: [],
    paginatedBrands: [],
    pagesCache: {},
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

    on(BrandActions.loadBrandsSuccess, (state, { brands }) => ({
        ...state,
        isLoading: false,
        error: null,
        brand: brands
    })),

    on(BrandActions.loadBrandsFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(BrandActions.loadPaginatedBrands, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(BrandActions.loadPaginatedBrandsSuccess, (state, { brands, totalRecords, pageNumber, pageSize, totalPages, cacheKey }) => ({
        ...state,
        isLoading: false,
        error: null,
        paginatedBrands: brands,
        pagesCache: {
            ...state.pagesCache,
            [cacheKey]: brands
        },
        totalRecords,
        pageNumber,
        pageSize,
        totalPages
    })),
    on(BrandActions.loadPaginatedBrandsFailure, (state, { error }) => ({
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
        paginatedBrands: [brand, ...state.paginatedBrands].slice(0, state.pageSize),
        pagesCache: {},
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
        brand: [...state.brand.filter(b => b.id !== brand.id), brand],
        paginatedBrands: state.paginatedBrands.map(b => b.id === brand.id ? brand : b),
        pagesCache: {}
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
        paginatedBrands: state.paginatedBrands.filter(b => b.id !== brandId),
        pagesCache: {},
        totalRecords: Math.max(0, state.totalRecords - 1)
    })),
    on(BrandActions.deleteBrandFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    }))
);
