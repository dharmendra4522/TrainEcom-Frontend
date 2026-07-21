import { createFeatureSelector } from '@ngrx/store';
import { CategoryState } from './category.reducer';
import * as CategoryActions from './category.action';
import { createSelector } from '@ngrx/store';


export const selectCateGoryState = createFeatureSelector<CategoryState>('category');

export const selectAllCategories = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.categories
)

export const selectCategoryLoading = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.isLoading
)
