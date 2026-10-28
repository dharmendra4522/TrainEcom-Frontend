import { createAction, props } from '@ngrx/store';
import { Brand, BrandListField, CreateBrandRequest, UpdateBrandRequest } from '../../models/brand.model';

export const loadBrands = createAction('[Brand] Load Brands');

export const loadBrandsSuccess = createAction(
  '[Brand] Load Brands Success',
  props<{ brands: Brand[] }>()
);

export const loadBrandsFailure = createAction(
  '[Brand] Load Brands Failure',
  props<{ error: string }>()
);

export const loadSingleBrand = createAction(
  `[Brand] Load Single Brand`,
  props<{ brandId: number }>()
);

export const loadSingleBrandSuccess = createAction(
  `[Brand] Load Single Brand Success`,
  props<{ brand: Brand }>()
);

export const loadSingleBrandFailure = createAction(
  `[Brand] Load Single Brand Failure`,
  props<{ error: string }>()
);

export const createBrand = createAction(
  `[Brand] Create Brand`,
  props<{ brand: CreateBrandRequest }>()
);

export const createBrandSuccess = createAction(
  `[Brand] Create Brand Success`,
  props<{ brand: Brand }>()
);

export const createBrandFailure = createAction(
  `[Brand] Create Brand Failure`,
  props<{ error: string }>()
);

export const updateBrand = createAction(
  `[Brand] Update Brand`,
  props<{ brandId: number; brand: UpdateBrandRequest }>()
);

export const updateBrandSuccess = createAction(
  `[Brand] Update Brand Success`,
  props<{ brand: Brand }>()
);

export const updateBrandFailure = createAction(
  `[Brand] Update Brand Failure`,
  props<{ error: string }>()
);

export const deleteBrand = createAction(
  `[Brand] Delete Brand`,
  props<{ brandId: number }>()
);

export const deleteBrandSuccess = createAction(
  `[Brand] Delete Brand Success`,
  props<{ brandId: number }>()
);

export const deleteBrandFailure = createAction(
  `[Brand] Delete Brand Failure`,
  props<{ error: string }>()
);

export const loadPaginatedBrands = createAction(
  '[Brand] Load Paginated Brands',
  props<{
    pageNumber: number;
    pageSize: number;
    search?: string;
    searchField?: BrandListField;
  }>()
);

export const loadPaginatedBrandsSuccess = createAction(
  '[Brand] Load Paginated Brands Success',
  props<{
    brands: Brand[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    cacheKey: string;
  }>()
);

export const loadPaginatedBrandsFailure = createAction(
  '[Brand] Load Paginated Brands Failure',
  props<{ error: string }>()
);
