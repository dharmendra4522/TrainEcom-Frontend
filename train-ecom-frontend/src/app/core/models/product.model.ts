export interface ProductImage {
  id: number | string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Product extends Record<string, unknown> {
  id: number | string;
  name: string;
  description: string;
  price: number;
  brandId?: number | string;
  brandName: string;
  categoryId?: number | string;
  categoryName: string;
  stockQuantity?: number;
  thumbnailUrl?: string;
  storeName?: string;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  images: ProductImage[];
}

export interface PaginatedProductsResponse {
  items: Product[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  minPrice: number;
  maxPrice: number;
  minStock: number;
  maxStock: number;
}

export enum ProductListField {
  Name = 1,
  Description = 2,
  Price = 3,
  StockQuantity = 4,
}

export interface ProductFilterPayload {
  searchQuery: string;
  categoryId: number | string;
  brandId: number | string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: string;
}

