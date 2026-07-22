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
