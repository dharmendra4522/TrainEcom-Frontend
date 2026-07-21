import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import * as ProductActions from './product.action';
import { map, catchError, filter, of, switchMap, exhaustMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllProducts } from './product.selectors';

@Injectable()
export class ProductEffects {
    private action$ = inject(Actions);
    private productService = inject(ProductService);
    private notification = inject(NotificationService);
    private router = inject(Router);
    private store = inject(Store);

    loadProducts$ = createEffect(() =>
        this.action$.pipe(
            ofType(ProductActions.loadProducts),
            withLatestFrom(this.store.select(selectAllProducts)),
            filter(([_, products]) => !products || products.length === 0),
            switchMap(() =>
                this.productService.getAllProducts().pipe(
                    map((products) => ProductActions.loadProductsSuccess({ products: products || [] })),
                    catchError((error) =>
                        of(ProductActions.loadProductsFailure({ error: error?.message || 'Failed to fetch products' }))
                    )
                )
            )
        )
    );

    createProduct$ = createEffect(() =>
        this.action$.pipe(
            ofType(ProductActions.createProduct),
            exhaustMap(({ productData, files }) =>
                this.productService.createProduct(productData, files).pipe(
                    map((product) => {
                        this.notification.showSuccess('Product created successfully', 'Close');
                        this.router.navigate(['/admin/products']);
                        return ProductActions.createProductSuccess({ product });
                    }),
                    catchError((error) => {
                        console.error('Error creating product:', error);
                        this.notification.showError('Error creating product', 'Close');
                        return of(ProductActions.loadProductsFailure({ error: error?.message || 'Error creating product' }));
                    })
                )
            )
        )
    );

    updateProduct$ = createEffect(() =>
        this.action$.pipe(
            ofType(ProductActions.updateProduct),
            exhaustMap(({ id, productData, newFiles, deletedImageIds }) =>
                this.productService.updateProduct(id, productData, newFiles, deletedImageIds).pipe(
                    map((product) => {
                        this.notification.showSuccess('Product updated successfully', 'Close');
                        this.router.navigate(['/admin/products']);
                        return ProductActions.updateProductSuccess({ product });
                    }),
                    catchError((error) => {
                        console.error('Error updating product:', error);
                        this.notification.showError('Error updating product', 'Close');
                        return of(ProductActions.loadProductsFailure({ error: error?.message || 'Error updating product' }));
                    })
                )
            )
        )
    );
}
