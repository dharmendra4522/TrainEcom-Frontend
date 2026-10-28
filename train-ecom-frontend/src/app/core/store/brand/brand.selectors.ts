import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BrandState } from './brand.reducer';

export const selectBrandState = createFeatureSelector<BrandState>('brand');

export const selectAllBrands = createSelector(
  selectBrandState,
  (state: BrandState) => state.brand || [],
);

export const selectBrandPagesCache = createSelector(
  selectBrandState,
  (state: BrandState) => state.pagesCache
);

export const selectBrandLoading = createSelector(
  selectBrandState,
  (state: BrandState) => state.isLoading
);

export const selectBrandError = createSelector(
  selectBrandState,
  (state: BrandState) => state.error
);

export const selectBrandTotalRecords = createSelector(
  selectBrandState,
  (state: BrandState) => state.totalRecords || 0
);

export const selectBrandPageNumber = createSelector(
  selectBrandState,
  (state: BrandState) => state.pageNumber || 1
);

export const selectBrandPageSize = createSelector(
  selectBrandState,
  (state: BrandState) => state.pageSize || 10
);

export const selectBrandById = (brandId: number) => createSelector(
  selectBrandState,
  (state: BrandState) => (state.brand || []).find(brand => brand.id === brandId)
);

export const selectBrandByName = (brandName: string) => createSelector(
  selectBrandState,
  (state: BrandState) => (state.brand || []).find(brand => brand.name === brandName)
);

export const selectPaginatedBrands = createSelector(
  selectBrandState,
  (state: BrandState) => state.paginatedBrands || []
);
