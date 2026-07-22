import { createAction, props } from '@ngrx/store';
import { Product } from '../../../core/models/product.model';

export const loadProducts = createAction(
    '[Product] Load Products',
    props<{ pageNumber?: number; pageSize?: number; brandName?: string; categoryName?: string }>()
);

export const loadProductsSuccess = createAction(
    '[Product] Load Products Success',
    props<{ products: Product[]; totalPages: number; pageNumber: number }>()
);

export const loadProductsFailure = createAction(
    '[Product] Load Products Failure',
    props<{ error: string }>()
)

export const createProduct = createAction(
    '[Product] Create Product',
    props<{ productData: Partial<Product>; files: File[] }>()
);

export const createProductSuccess = createAction(
    '[Product] Create Product Success',
    props<{ product: Product }>()
);

export const updateProduct = createAction(
    '[Product] Update Product',
    props<{ id: string; productData: Partial<Product>; newFiles: File[]; deletedImageIds: string[] }>()
);

export const updateProductSuccess = createAction(
    '[Product] Update Product Success',
    props<{ product: Product }>()
);
