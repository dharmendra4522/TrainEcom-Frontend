import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.reducer';

export const selectCateGoryState = createFeatureSelector<CategoryState>('category');

export const selectAllCategories = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.categories
);

export const selectCategoryPagesCache = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.pagesCache
);

export const selectCategoryLoading = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.isLoading
);

export const selectCategoryError = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.error
);

export const selectPaginatedCategories = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.paginatedCategories
);

export const selectCategoryTotalRecords = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.totalRecords
);

export const selectCategoryPageNumber = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.pageNumber
);

export const selectCategoryPageSize = createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.pageSize
);

export const selectCategoryById = (categoryId: number) => createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.categories.find(category => category.id === categoryId)
);

export const selectCategoryByName = (categoryName: string) => createSelector(
    selectCateGoryState,
    (categoryState: CategoryState) => categoryState.categories.find(category => category.name === categoryName)
);
