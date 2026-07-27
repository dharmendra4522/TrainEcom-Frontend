import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BrandState } from './brand.reducer';

export const selectBrandState = createFeatureSelector<BrandState>('brand');

export const selectAllBrands = createSelector(
  selectBrandState,
  (state: BrandState) => state.brands,
);

export const selectBrandLoading = createSelector(
  selectBrandState,
  (state: BrandState) => state.isLoading,
);

export const selectBrandError = createSelector(
  selectBrandState,
  (state: BrandState) => state.error,
);

export const selectBrandById = (brandId: string) => createSelector(
  selectBrandState,
  (state: BrandState) => state.brands.find(brand => brand.id === brandId),
);

export const selectBrandByName = (brandName: string) => createSelector(
  selectBrandState,
  (state: BrandState) => state.brands.find(brand => brand.name === brandName),
);