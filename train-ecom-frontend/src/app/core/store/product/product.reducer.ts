import { Product } from '../../../core/models/product.model';
import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.action';

export interface ProductState {
  products: Product[];
  relatedProducts: Product[];
  pageNumber: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
}

export const initialProductState: ProductState = {
  products: [],
  relatedProducts: [],
  pageNumber: 1,
  totalPages: 1,
  totalRecords: 0,
  isLoading: false,
  error: null,
};

export const productReducer = createReducer(
  initialProductState,

  on(ProductActions.loadProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(
    ProductActions.loadProductsSuccess,
    (
      state,
      { products, totalPages = 1, pageNumber = 1, totalRecords = 0 },
    ) => ({
      ...state,
      products: products,
      totalPages: totalPages,
      pageNumber: pageNumber,
      totalRecords: totalRecords,
      isLoading: false,
      error: null,
    }),
  ),

  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),
  on(ProductActions.createProductSuccess, (state, { product }) => ({
    ...state,
    products: [...state.products, product],
    isLoading: false,
    error: null,
  })),

  on(ProductActions.updateProductSuccess, (state, { product }) => {
    const existingProduct = state.products.find((p) => p.id.toString() === product.id.toString());
    const primaryImg = product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
    const resolvedThumbnailUrl = product.thumbnailUrl || primaryImg || existingProduct?.thumbnailUrl;

    const updatedProduct = {
      ...product,
      thumbnailUrl: resolvedThumbnailUrl
    };

    return {
      ...state,
      products: state.products.map((p) => p.id.toString() === product.id.toString() ? updatedProduct : p),
      isLoading: false,
      error: null,
    };
  }),

  on(ProductActions.createProductFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),
  on(ProductActions.updateProductFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),
  on(ProductActions.createProduct, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProductActions.updateProduct, (state) => ({
    ...state,
    isLoading: true,  
    error: null,
  })),
  on(ProductActions.deleteProduct, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ProductActions.deleteProductSuccess, (state, { productId }) => ({
    ...state,
    products: state.products.filter((p) => p.id.toString() !== productId.toString()),
    totalRecords: Math.max(0, state.totalRecords - 1),
    isLoading: false,
    error: null,
  })),
  on(ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),

  on(ProductActions.loadProductById, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(ProductActions.loadProductByIdSuccess, (state, { product }) => {
    const existingProduct = state.products.find((p) => p.id.toString() === product.id.toString());
    const primaryImg = product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
    const resolvedThumbnailUrl = product.thumbnailUrl || primaryImg || existingProduct?.thumbnailUrl;

    const updatedProduct = {
      ...product,
      thumbnailUrl: resolvedThumbnailUrl
    };

    return {
      ...state,
      products: existingProduct
        ? state.products.map((p) => p.id.toString() === product.id.toString() ? updatedProduct : p)
        : [...state.products, updatedProduct],
      isLoading: false,
      error: null,
    };
  }),

  on(ProductActions.loadProductByIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),

  on(ProductActions.loadRelatedProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    relatedProducts: [],
  })),

  on(ProductActions.loadRelatedProductsSuccess, (state, { products }) => ({
    ...state,
    relatedProducts: products,
    isLoading: false,
    error: null,
  })),

  on(ProductActions.loadRelatedProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  })),
);
