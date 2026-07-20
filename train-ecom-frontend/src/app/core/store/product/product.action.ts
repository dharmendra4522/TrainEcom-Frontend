import { createAction, props } from '@ngrx/store';
import { Product } from '../../../core/models/product.model';

export const loadProducts = createAction(
    '[Product] Load Products',
    props<{ products: Product[] }>()
)

export const loadProductsSuccess = createAction(
    '[Product] Load Products Success',
    props<{ products: Product[] }>()
)

export const loadProductsFailure = createAction(
    '[Product] Load Products Failure',
    props<{ error: string }>()
)