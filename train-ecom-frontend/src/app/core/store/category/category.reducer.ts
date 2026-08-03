import * as CategoryActions from './category.action';
import { Category } from '../../models/category.model';
import { createReducer, on } from '@ngrx/store';

export interface CategoryState {
    categories: Category[];
    paginatedCategories: Category[];
    pagesCache: { [key: string]: Category[] };
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
}


export const initialCategoryState: CategoryState = {
    categories: [],
    paginatedCategories: [],
    pagesCache: {},
    totalRecords: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    isLoading: false,
    error: null
}

export const categoryReducer = createReducer(
    initialCategoryState,

    on(CategoryActions.loadCategories, (state: CategoryState) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(CategoryActions.loadCategoriesSuccess, (state: CategoryState, { categories }) => ({
        ...state,
        isLoading: false,
        error: null,
        categories
    })),

    on(CategoryActions.loadCategoriesFailure, (state: CategoryState, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(CategoryActions.loadPaginatedCategories, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(CategoryActions.loadPaginatedCategoriesSuccess, (state, { categories, totalRecords, pageNumber, pageSize, totalPages, cacheKey }) => ({
        ...state,
        isLoading: false,
        error: null,
        paginatedCategories: categories,
        pagesCache: {
            ...state.pagesCache,
            [cacheKey]: categories
        },
        totalRecords,
        pageNumber,
        pageSize,
        totalPages
    })),
    on(CategoryActions.loadPaginatedCategoriesFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(CategoryActions.loadSingleCategory, (state: CategoryState) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(CategoryActions.loadSingleCategorySuccess, (state: CategoryState, { category }) => ({
        ...state,
        isLoading: false,
        error: null,
        categories: [...state.categories.filter(c => c.id !== category.id), category]
    })),
    on(CategoryActions.loadSingleCategoryFailure, (state: CategoryState, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(CategoryActions.createCategory, (state: CategoryState) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(CategoryActions.createCategorySuccess, (state: CategoryState, { category }) => ({
        ...state,
        isLoading: false,
        error: null,
        categories: [...state.categories, category],
        paginatedCategories: [category, ...state.paginatedCategories].slice(0, state.pageSize),
        pagesCache: {},
        totalRecords: state.totalRecords + 1
    })),
    on(CategoryActions.createCategoryFailure, (state: CategoryState, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(CategoryActions.updateCategory, (state: CategoryState) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(CategoryActions.updateCategorySuccess, (state: CategoryState, { category }) => ({
        ...state,
        isLoading: false,
        error: null,
        categories: [...state.categories.filter(c => c.id !== category.id), category],
        paginatedCategories: state.paginatedCategories.map(c => c.id === category.id ? category : c),
        pagesCache: {}
    })),
    on(CategoryActions.updateCategoryFailure, (state: CategoryState, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(CategoryActions.deleteCategory, (state: CategoryState) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(CategoryActions.deleteCategorySuccess, (state: CategoryState, { categoryId }) => ({
        ...state,
        isLoading: false,
        error: null,
        categories: state.categories.filter(c => c.id !== categoryId),
        paginatedCategories: state.paginatedCategories.filter(c => c.id !== categoryId),
        pagesCache: {},
        totalRecords: Math.max(0, state.totalRecords - 1)
    })),
    on(CategoryActions.deleteCategoryFailure, (state: CategoryState, { error }) => ({
        ...state,   
        isLoading: false,
        error
    }))

)
