import { createAction, props } from '@ngrx/store';
import { Product, ProductListField } from '../../../core/models/product.model';
import { PortalKey } from '../../config/management-access.config';

export const loadProducts = createAction(
  '[Product] Load Products',
  props<{
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    searchField?: ProductListField;
    requestField?: ProductListField;
    categoryIds?: number[];
    subCategoryIds?: number[];
    brandIds?: number[];
    storeName?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
    sortBy?: string;
    minRating?: number;
    filterIds?: number[];
    isAppend?: boolean;
    portal?: PortalKey;
  }>(),
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{
    products: Product[];
    totalPages: number;
    pageNumber: number;
    totalRecords: number;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
    cacheKey: string;
    isAppend?: boolean;
  }>(),
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: string }>(),
);

export const createProduct = createAction(
  '[Product] Create Product',
  props<{ productData: Partial<Product>; files: File[]; portal?: PortalKey }>(),
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
    id: number;
    productData: Partial<Product>;
    newFiles: File[];
    deletedImageIds: Array<string | number>;
    portal?: PortalKey;
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
  props<{ productId: number; portal?: PortalKey }>(),
);

export const deleteProductSuccess = createAction(
  '[Product] Delete Product Success',
  props<{ productId: number }>(),
);

export const deleteProductFailure = createAction(
  '[Product] Delete Product Failure',
  props<{ error: string }>(),
);

export const loadProductById = createAction(
  '[Product] Load Product By Id',
  props<{ id: number; portal?: PortalKey }>(),
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
  props<{ productId: number }>(),
);

export const loadRelatedProductsSuccess = createAction(
  '[Product] Load Related Products Success',
  props<{ products: Product[] }>(),
);

export const loadRelatedProductsFailure = createAction(
  '[Product] Load Related Products Failure',
  props<{ error: string }>(),
);
