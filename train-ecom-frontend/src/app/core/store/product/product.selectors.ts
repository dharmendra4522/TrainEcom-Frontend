import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.reducer';

export const selectProductState =
  createFeatureSelector<ProductState>('product');

export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);

export const selectProductPagesCache = createSelector(
  selectProductState,
  (state: ProductState) => state.pagesCache
);

export const selectProductsLoading = createSelector(
  selectProductState,
  (state: ProductState) => state.isLoading
);

export const selectProductTotalRecords = createSelector(
  selectProductState,
  (state: ProductState) => state.totalRecords || 0
);

export const selectProductById = (productId: number) =>
  createSelector(selectProductState, (state: ProductState) =>
    state.products.find((product) => product.id === productId)
  );
export const selectProductError = createSelector(
  selectProductState,
  (state: ProductState) => state.error
);

export const selectProductPageNumber = createSelector(
  selectProductState,
  (state: ProductState) => state.pageNumber
);

export const selectProductTotalPages = createSelector(
  selectProductState,
  (state: ProductState) => state.totalPages
);

export const selectRelatedProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.relatedProducts || []
);

export const selectProductMinPrice = createSelector(
  selectProductState,
  (state) => state.minPrice
);

export const selectProductMaxPrice = createSelector(
  selectProductState,
  (state) => state.maxPrice
);

export const selectProductMinStock = createSelector(
  selectProductState,
  (state) => state.minStock
);

export const selectProductMaxStock = createSelector(
  selectProductState,
  (state) => state.maxStock
);
