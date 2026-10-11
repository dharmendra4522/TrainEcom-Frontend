import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import * as ProductActions from './product.action';
import { map, catchError, of, switchMap, exhaustMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  selectProductTotalPages,
  selectProductTotalRecords,
  selectProductPagesCache
} from './product.selectors';

import { extractBackendMessage } from '../../utils/error.utils';
import { PortalRouteService } from '../../services/portal-route.service';

@Injectable()
export class ProductEffects {
  private action$ = inject(Actions);
  private productService = inject(ProductService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private portalRoutes = inject(PortalRouteService);
  private store = inject(Store);

  loadProducts$ = createEffect(() =>
    this.action$.pipe(
      ofType(ProductActions.loadProducts),
      withLatestFrom(
        this.store.select(selectProductPagesCache),
        this.store.select(selectProductTotalPages),
        this.store.select(selectProductTotalRecords),
      ),
      switchMap(([action, pagesCache, totalPages, totalRecords]) => {
        const pageNumber = action.pageNumber ?? 1;
        const pageSize = action.pageSize ?? 10;
        const search = action.search || '';
        const searchField = action.searchField;
        const requestField = action.requestField;
        const categoryIds = action.categoryIds ?? [];
        const subCategoryIds = action.subCategoryIds ?? [];
        const brandIds = action.brandIds ?? [];
        const storeName = action.storeName;
        const minPrice = action.minPrice;
        const maxPrice = action.maxPrice;
        const minStock = action.minStock;
        const maxStock = action.maxStock;
        const sortBy = action.sortBy || '';
        const minRating = action.minRating;
        const filterIds = action.filterIds ?? [];
        const portal = action.portal;
        const cacheKey = `${portal ?? 'public'}-${pageNumber}-${pageSize}-${brandIds.join(',')}-${categoryIds.join(',')}-${subCategoryIds.join(',')}-${storeName}-${search}-${searchField}-${requestField}-${minPrice ?? ''}-${maxPrice ?? ''}-${minStock ?? ''}-${maxStock ?? ''}-${sortBy}-${minRating ?? ''}-${filterIds}`;
        if (action.isAppend && pagesCache[cacheKey]) {
          const computedCacheTotalPages =
            totalPages > 0
              ? totalPages
              : Math.max(1, Math.ceil(totalRecords / pageSize));
          return of(
            ProductActions.loadProductsSuccess({
              products: pagesCache[cacheKey],
              totalPages: computedCacheTotalPages,
              pageNumber,
              totalRecords,
              cacheKey,
              isAppend: action.isAppend,
            }),
          );
        }

        return this.productService
          .getPaginatedProducts(
            pageNumber,
            pageSize,
            action.search,
            action.searchField,
            action.requestField,
            action.categoryIds,
            action.subCategoryIds,
            action.brandIds,
            action.storeName,
            action.minStock,
            action.maxStock,
            action.minPrice,
            action.maxPrice,
            action.sortBy,
            action.minRating,
            action.filterIds,
            portal,
          )
          .pipe(
            map((response) => {
              // calculate total pages based on totalRecords and pageSize
              const totalRecs = response?.totalRecords || 0;
              const computedPages =
                response?.totalPages && response.totalPages > 0
                  ? response.totalPages
                  : Math.max(1, Math.ceil(totalRecs / pageSize));

              return ProductActions.loadProductsSuccess({
                products: response?.items || [],
                pageNumber,
                totalPages: computedPages,
                totalRecords: totalRecs,
                minPrice: response.minPrice ?? 0,
                maxPrice: response.maxPrice ?? 0,
                minStock: response.minStock ?? 0,
                maxStock: response.maxStock ?? 0,
                cacheKey,
                isAppend: action.isAppend,
              });
            }),
            catchError((error: unknown) =>
              of(
                ProductActions.loadProductsFailure({
                  error: extractBackendMessage(
                    error,
                    'Failed to fetch products',
                  )
                })
              )
            )
          );
      })
    )
  );

  createProduct$ = createEffect(() =>
    this.action$.pipe(
      ofType(ProductActions.createProduct),
      exhaustMap(({ productData, files, portal }) =>
        this.productService.createProduct(productData, files, portal).pipe(
          map((product) => {
            this.notification.showSuccess(
              'Product created successfully',
              'Close'
            );
            if (portal)
              this.router.navigate(
                this.portalRoutes.products(portal, 'manage'),
              );
            return ProductActions.createProductSuccess({ product });
          }),
          catchError((error: unknown) => {
            console.error('Error creating product:', error);
            const msg = extractBackendMessage(error, 'Error creating product');
            this.notification.showError(msg, 'Close');
            return of(ProductActions.createProductFailure({ error: msg }));
          })
        )
      )
    )
  );

  updateProduct$ = createEffect(() =>
    this.action$.pipe(
      ofType(ProductActions.updateProduct),
      exhaustMap(({ id, productData, newFiles, deletedImageIds, portal }) =>
        this.productService
          .updateProduct(id, productData, newFiles, deletedImageIds, portal)
          .pipe(
            map((product) => {
              this.notification.showSuccess(
                'Product updated successfully',
                'Close'
              );
              if (portal)
                this.router.navigate(
                  this.portalRoutes.products(portal, 'manage'),
                );
              return ProductActions.updateProductSuccess({ product });
            }),
            catchError((error: unknown) => {
              console.error('Error updating product:', error);
              const msg = extractBackendMessage(
                error,
                'Error updating product'
              );
              this.notification.showError(msg, 'Close');
              return of(ProductActions.updateProductFailure({ error: msg }));
            })
          )
      )
    )
  );

  deleteProduct$ = createEffect(() =>
    this.action$.pipe(
      ofType(ProductActions.deleteProduct),
      exhaustMap(({ productId, portal }) =>
        this.productService.deleteProduct(productId, portal).pipe(
          map(() => {
            this.notification.showSuccess(
              'Product deleted successfully',
              'Close'
            );
            return ProductActions.deleteProductSuccess({ productId });
          }),
          catchError((error: unknown) => {
            console.error('Error deleting product:', error);
            const msg = extractBackendMessage(error, 'Error deleting product');
            this.notification.showError(msg, 'Close');
            return of(ProductActions.deleteProductFailure({ error: msg }));
          })
        )
      )
    )
  );

  loadProductById$ = createEffect(() =>
    this.action$.pipe(
      ofType(ProductActions.loadProductById),
      switchMap(({ id, portal }) =>
        this.productService.getProductById(id, portal).pipe(
          map((product) => ProductActions.loadProductByIdSuccess({ product })),
          catchError((error) =>
            of(
              ProductActions.loadProductByIdFailure({
                error: error?.message || 'Failed to fetch product details'
              })
            )
          )
        )
      )
    )
  );

  loadRelatedProducts$ = createEffect(() =>
    this.action$.pipe(
      ofType(ProductActions.loadRelatedProducts),
      switchMap(({ productId }) =>
        this.productService.getRelatedProducts(productId).pipe(
          map((products) =>
            ProductActions.loadRelatedProductsSuccess({
              products: products || []
            })
          ),
          catchError((error) =>
            of(
              ProductActions.loadRelatedProductsFailure({
                error: error?.message || 'Failed to fetch related products'
              })
            )
          )
        )
      )
    )
  );
}
