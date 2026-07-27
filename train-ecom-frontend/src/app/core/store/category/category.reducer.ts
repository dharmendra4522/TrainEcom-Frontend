import * as CategoryActions from './category.action';
import { Category } from '../../models/category.model';
import { createReducer, on } from '@ngrx/store';

export interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
}


export const initialCategoryState: CategoryState = {
    categories: [],
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
        categories: [...state.categories, category]
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
        categories: [...state.categories.filter(c => c.id !== category.id), category]
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
        categories: state.categories.filter(c => c.id !== categoryId)
    })),
    on(CategoryActions.deleteCategoryFailure, (state: CategoryState, { error }) => ({
        ...state,   
        isLoading: false,
        error
    }))

)