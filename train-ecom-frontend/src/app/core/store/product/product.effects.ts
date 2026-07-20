import { Injectable, inject } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { ProductService } from '../../services/product.service';
import * as ProductActions from './product.action';
import { exhaustMap } from 'rxjs/internal/operators/exhaustMap';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs';

@Injectable()
export class ProductEffects {
    private action$ = inject(Actions);
    private productService = inject(ProductService);

    loadProducts$ = this.action$.pipe(
        ofType(ProductActions.loadProducts),
        exhaustMap(() =>
            this.productService.getAllProducts().pipe(
                map((products) => ProductActions.loadProductsSuccess({ products })),
                catchError((error) =>
                    of(ProductActions.loadProductsFailure({ error: error.message }))
                )
            )
        )
    );

}
