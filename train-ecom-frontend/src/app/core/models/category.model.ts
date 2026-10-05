export interface Category extends Record<string, unknown> {
  id: number;
  name: string;
  description: string;
  subCategories?: SubCategoryItem[];
  productCount?: number;
  numberOfProducts?: number;
}

export interface SubCategoryItem {
  id: number;
  name: string;
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
  numberOfSubCategories?: number;
}

export interface SubCategoryList extends Record<string, unknown> {
  id: number;
  subCategoryName: string;
  parentCategoryName: string;
  parentCategoryId?: number | string | null;
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

