import { createAction, props } from '@ngrx/store';
import {
  Category,
  CategoryListField,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../../models/category.model';

export const loadCategories = createAction('[Category] Load Categories');

export const loadCategoriesSuccess = createAction(
  '[Category] Load Categories Success',
  props<{ categories: Category[] }>(),
);

export const loadCategoriesFailure = createAction(
  '[Category] Load Categories Failure',
  props<{ error: string }>(),
);

export const loadSingleCategory = createAction(
  `[Category] Load Single Category`,
  props<{ categoryId: string }>(),
);

export const loadSingleCategorySuccess = createAction(
  `[Category] Load Single Category Success`,
  props<{ category: Category }>(),
);

export const loadSingleCategoryFailure = createAction(
  `[Category] Load Single Category Failure`,
  props<{ error: string }>(),
);

export const createCategory = createAction(
  `[Category] Create Category`,
  props<{ category: CreateCategoryRequest }>(),
);

export const createCategorySuccess = createAction(
  `[Category] Create Category Success`,
  props<{ category: Category }>(),
);

export const createCategoryFailure = createAction( 
  `[Category] Create Category Failure`,
  props<{ error: string }>(),
);

export const updateCategory = createAction(
  `[Category] Update Category`,
  props<{ categoryId: string | number; category: UpdateCategoryRequest }>(),
);

export const updateCategorySuccess = createAction(
  `[Category] Update Category Success`,
  props<{ category: Category }>(),
);

export const updateCategoryFailure = createAction(
  `[Category] Update Category Failure`,
  props<{ error: string }>(),
);

export const deleteCategory = createAction(
  `[Category] Delete Category`,
  props<{ categoryId: string | number }>(),
);

export const deleteCategorySuccess = createAction(
  `[Category] Delete Category Success`,
  props<{ categoryId: string | number }>(),
);

export const deleteCategoryFailure = createAction(
  `[Category] Delete Category Failure`,
  props<{ error: string }>(),
);

export const loadPaginatedCategories = createAction(
  '[Category] Load Paginated Categories',
  props<{
    pageNumber: number;
    pageSize: number;
    search?: string;
    refresh?: boolean;
    searchField?: CategoryListField;
  }>(),
);

export const loadPaginatedCategoriesSuccess = createAction(
  '[Category] Load Paginated Categories Success',
  props<{ categories: Category[]; totalRecords: number; pageNumber: number; pageSize: number; totalPages: number; cacheKey: string }>(),
);

export const loadPaginatedCategoriesFailure = createAction(
  '[Category] Load Paginated Categories Failure',
  props<{ error: string }>(),
);
