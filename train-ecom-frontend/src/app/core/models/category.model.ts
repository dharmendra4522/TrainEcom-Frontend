export interface Category extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
}

export interface PaginatedCategoryResponse {
  items: Category[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  numberOfProducts?: number;
}
