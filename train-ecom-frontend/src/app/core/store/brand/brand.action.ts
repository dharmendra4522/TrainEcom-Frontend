import { createAction, props } from '@ngrx/store';
import { Brand } from '../../models/product.model';

export const loadBrands = createAction(
    '[Brand] Load Brands'
)

export const loadBrandsSuccess = createAction(
    '[Brand] Load Brands Success',
    props<{ brands: Brand[] }>()
)

export const loadBrandsFailure = createAction(
    '[Brand] Load Brands Failure',
    props<{ error: string }>()
)