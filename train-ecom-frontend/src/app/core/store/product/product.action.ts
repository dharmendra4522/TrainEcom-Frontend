import { createAction, props } from '@ngrx/store';
import { Product } from '../../../core/models/product.model';

export const loadProducts = createAction(
  '[Product] Load Products',
  props<{
    pageNumber?: number;
    pageSize?: number;
    brandName?: string;
    categoryName?: string;
    search?: string;
  }>(),
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{
    products: Product[];
    totalPages: number;
    pageNumber: number;
    totalRecords: number;
  }>(),
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: string }>(),
);

export const createProduct = createAction(
  '[Product] Create Product',
  props<{ productData: Partial<Product>; files: File[] }>(),
);

export const createProductSuccess = createAction(
  '[Product] Create Product Success',
  props<{ product: Product }>(),
);


export const createProductFailure = createAction(
  '[Product] Create Product Failure',
  props<{ error: string }>(),
);

export const updateProduct = createAction(
  '[Product] Update Product',
  props<{
    id: string;
    productData: Partial<Product>;
    newFiles: File[];
    deletedImageIds: string[];
  }>(),
);

export const updateProductSuccess = createAction(
  '[Product] Update Product Success',
  props<{ product: Product }>(),
);

export const updateProductFailure = createAction(
  '[Product] Update Product Failure',
  props<{ error: string }>(),
);


export const deleteProduct = createAction(
  '[Product] Delete Product',
  props<{ productId: string }>(),
);

export const deleteProductSuccess = createAction(
  '[Product] Delete Product Success',
  props<{ productId: string }>(),
);

export const deleteProductFailure = createAction(
  '[Product] Delete Product Failure',
  props<{ error: string }>(),
);

export const loadProductById = createAction(
  '[Product] Load Product By Id',
  props<{ id: string }>(),
);

export const loadProductByIdSuccess = createAction(
  '[Product] Load Product By Id Success',
  props<{ product: Product }>(),
);

export const loadProductByIdFailure = createAction(
  '[Product] Load Product By Id Failure',
  props<{ error: string }>(),
);

export const loadRelatedProducts = createAction(
  '[Product] Load Related Products',
  props<{ productId: string }>(),
);

export const loadRelatedProductsSuccess = createAction(
  '[Product] Load Related Products Success',
  props<{ products: Product[] }>(),
);

export const loadRelatedProductsFailure = createAction(
  '[Product] Load Related Products Failure',
  props<{ error: string }>(),
);