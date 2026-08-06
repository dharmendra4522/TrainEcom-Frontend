export interface Brand extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
}

export interface CreateBrandRequest {
  name: string;
  description: string;
}

export interface UpdateBrandRequest {
  name: string;
  description: string;
}


export interface PaginatedBrandResponse {
  items: Brand[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  numberOfProducts?: number;
}
