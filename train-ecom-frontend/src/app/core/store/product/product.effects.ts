import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import * as ProductActions from './product.action';
import { map, catchError, filter, of, switchMap, mergeMap, exhaustMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllProducts, selectProductPageNumber, selectProductTotalPages, selectProductTotalRecords, selectProductPagesCache } from './product.selectors';

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
                this.store.select(selectProductTotalRecords)
            ),
            switchMap(([action, pagesCache, totalPages, totalRecords]) => {
                const pageNumber = action.pageNumber || 1;
                const pageSize = action.pageSize || 10;
                const brandName = action.brandName || '';
                const categoryName = action.categoryName || '';
                const search = action.search || '';
                const minPrice = action.minPrice;
                const maxPrice = action.maxPrice;
                const sortBy = action.sortBy || '';
                const minRating = action.minRating;

                const portal = action.portal;
                const cacheKey = `${portal ?? 'public'}-${pageNumber}-${pageSize}-${brandName}-${categoryName}-${search}-${minPrice ?? ''}-${maxPrice ?? ''}-${sortBy}-${minRating ?? ''}`;

                if (action.isAppend && pagesCache[cacheKey]) {
                    const computedCacheTotalPages = totalPages > 0 ? totalPages : Math.max(1, Math.ceil(totalRecords / pageSize));
                    return of(ProductActions.loadProductsSuccess({
                        products: pagesCache[cacheKey],
                        totalPages: computedCacheTotalPages,
                        pageNumber,
                        totalRecords,
                        cacheKey,
                        isAppend: action.isAppend
                    }));
                }

                return this.productService.getPaginatedProducts(
                    pageNumber,
                    pageSize,
                    action.brandName,
                    action.categoryName,
                    action.search,
                    action.minPrice,
                    action.maxPrice,
                    action.sortBy,
                    action.minRating,
                    portal
                ).pipe(
                    map((response) => {
                        // calculate total pages based on totalRecords and pageSize
                        const totalRecs = response?.totalRecords || 0;
                        const computedPages = (response?.totalPages && response.totalPages > 0)
                            ? response.totalPages
                            : Math.max(1, Math.ceil(totalRecs / pageSize));

                        return ProductActions.loadProductsSuccess({
                            products: response?.items || [],
                            totalPages: computedPages,
                            pageNumber: pageNumber,
                            totalRecords: totalRecs,
                            cacheKey,
                            isAppend: action.isAppend
                        });
                    }),
                    catchError((error) =>
                        of(ProductActions.loadProductsFailure({ error: extractBackendMessage(error, 'Failed to fetch products') }))
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
                        this.notification.showSuccess('Product created successfully', 'Close');
                        if (portal) this.router.navigate(this.portalRoutes.products(portal, 'manage'));
                        return ProductActions.createProductSuccess({ product });
                    }),
                    catchError((error) => {
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
                this.productService.updateProduct(id, productData, newFiles, deletedImageIds, portal).pipe(
                    map((product) => {
                        this.notification.showSuccess('Product updated successfully', 'Close');
                        if (portal) this.router.navigate(this.portalRoutes.products(portal, 'manage'));
                        return ProductActions.updateProductSuccess({ product });
                    }),
                    catchError((error) => {
                        console.error('Error updating product:', error);
                        const msg = extractBackendMessage(error, 'Error updating product');
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
                        this.notification.showSuccess('Product deleted successfully', 'Close');
                        return ProductActions.deleteProductSuccess({ productId });
                    }),
                    catchError((error) => {
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
                        of(ProductActions.loadProductByIdFailure({ error: error?.message || 'Failed to fetch product details' }))
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
                    map((products) => ProductActions.loadRelatedProductsSuccess({ products: products || [] })),
                    catchError((error) =>
                        of(ProductActions.loadRelatedProductsFailure({ error: error?.message || 'Failed to fetch related products' }))
                    )
                )
            )
        )
    );

}
