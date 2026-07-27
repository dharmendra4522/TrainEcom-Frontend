import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.reducer';

export const selectCateGoryState = createFeatureSelector<CategoryState>('category');

export const selectAllCategories = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.categories
);

export const selectCategoryLoading = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.isLoading
);

export const selectCategoryError = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.error
);

export const selectCategoryById = (categoryId: string) => createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.categories.find(category => category.id === categoryId)
);

export const selectCategoryByName = (categoryName: string) => createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.categories.find(category => category.name === categoryName)
);
