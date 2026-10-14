export interface Brand extends Record<string, unknown> {
  id: number;
  name: string;
  description: string;
  productCount?: number;
  numberOfProducts?: number;
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

export enum BrandListField {
  Name = 1,
  Description = 2,
  ID=3,
}