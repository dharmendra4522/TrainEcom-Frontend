import * as CategoryActions from './category.action';
import { Category } from '../../models/product.model';
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
    }))
)