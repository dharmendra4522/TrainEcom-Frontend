export interface Category extends Record<string, unknown> {
  id: number | string;
  name: string;
  description: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  parentCategoryId?: number | null;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  parentCategoryId?: number | null;
}

export interface PaginatedCategoryResponse {
  items: Category[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  numberOfProducts?: number;
}

export interface SubCategoryList {
  id: number;
  subCategoryName: string;
  parentCategoryName: string;
  description: string;
  productCount: number;
}

export interface PaginatedSubCategoryResponse {
  items: SubCategoryList[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface SubCategoryList extends Record<string, unknown> {
  id: number;
  subCategoryName: string;
  parentCategoryName: string;
  description: string;
  productCount: number;
}
