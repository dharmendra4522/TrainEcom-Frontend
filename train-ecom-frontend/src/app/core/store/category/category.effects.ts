import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CategoryService } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';
import { Store } from '@ngrx/store';
import * as CategoryActions from './category.action';
import { selectAllCategories, selectCategoryPageNumber, selectCategoryPageSize, selectCategoryTotalRecords, selectPaginatedCategories, selectCategoryPagesCache } from './category.selectors';
import { withLatestFrom, map, catchError, of, exhaustMap } from 'rxjs';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.loadCategories),
      withLatestFrom(this.store.select(selectAllCategories)),
      exhaustMap(([_, categories]) => {
        if (categories && categories.length > 0) {
          return of(CategoryActions.loadCategoriesSuccess({ categories }));
        }
        return this.categoryService.getAllCategories().pipe(
          map((categories) =>
            CategoryActions.loadCategoriesSuccess({
              categories: categories || [],
            }),
          ),
          catchError((error) =>
            of(
              CategoryActions.loadCategoriesFailure({
                error: error?.message || 'Failed to load categories',
              }),
            ),
          ),
        );
      })
    ),
  );

  loadPaginatedCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.loadPaginatedCategories),
      withLatestFrom(
        this.store.select(selectCategoryPagesCache),
        this.store.select(selectCategoryTotalRecords),
      ),
      exhaustMap(([action, pagesCache, totalRecords]) => {
        const { pageNumber, pageSize, search } = action;
        const cacheKey = search ? `search-${search.trim()}-${pageNumber}-${pageSize}` : `${pageNumber}-${pageSize}`;

        if (pagesCache[cacheKey]) {
          return of(CategoryActions.loadPaginatedCategoriesSuccess({
            categories: pagesCache[cacheKey],
            totalRecords,
            pageNumber,
            pageSize,
            totalPages: Math.ceil(totalRecords / pageSize) || 1,
            cacheKey
          }));
        }

        return this.categoryService.getPaginatedCategories(pageNumber, pageSize, search).pipe(
          map((response) => CategoryActions.loadPaginatedCategoriesSuccess({
            categories: response.items,
            totalRecords: response.totalRecords,
            pageNumber: response.pageNumber,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
            cacheKey
          })),
          catchError((error) => of(CategoryActions.loadPaginatedCategoriesFailure({
            error: error?.message || 'Failed to load categories',
          }))),
        );
      }),
    ),
  );

  loadSingleCategory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CategoryActions.loadSingleCategory),
      exhaustMap(({ categoryId }) =>
        this.categoryService.getCategoryById(categoryId).pipe(
          map((category) =>
            CategoryActions.loadSingleCategorySuccess({ category }),
          ),
          catchError((error) =>
            of(
              CategoryActions.loadSingleCategoryFailure({
                error: error?.message || 'Failed to load category',
              }),
            ),
          ),
        ),
      ),
    );
  });

  createCategory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CategoryActions.createCategory),
      exhaustMap(({ category }) =>
        this.categoryService.createCategory(category).pipe(
          map((createdCategory) => {
            this.notification.showSuccess('Category created successfully!');
            return CategoryActions.createCategorySuccess({ category: createdCategory });
          }),
          catchError((error) => {
            this.notification.showError(error?.message || 'Failed to create category');
            return of(CategoryActions.createCategoryFailure({ error: error?.message || 'Failed to create category' }));
          }),
        ),
      ),
    );
  });

  updateCategory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CategoryActions.updateCategory),
      exhaustMap(({ categoryId, category }) =>
        this.categoryService.updateCategory(categoryId, category).pipe(
          map((updatedCategory) => {
            this.notification.showSuccess('Category updated successfully!');
            return CategoryActions.updateCategorySuccess({ category: updatedCategory });
          }),
          catchError((error) => {
            this.notification.showError(error?.message || 'Failed to update category');
            return of(CategoryActions.updateCategoryFailure({ error: error?.message || 'Failed to update category' }));
          }),
        ),
      ),
    );
  });

  deleteCategory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CategoryActions.deleteCategory),
      exhaustMap(({ categoryId }) =>
        this.categoryService.deleteCategory(categoryId).pipe(
          map(() => {
            this.notification.showSuccess('Category deleted successfully.');
            return CategoryActions.deleteCategorySuccess({ categoryId });
          }),
          catchError((error) => {
            this.notification.showError(error?.message || 'Failed to delete category');
            return of(CategoryActions.deleteCategoryFailure({ error: error?.message || 'Failed to delete category' }));
          }),
        ),
      ),
    );
  });
}
