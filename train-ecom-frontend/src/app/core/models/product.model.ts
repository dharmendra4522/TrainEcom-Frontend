export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Product extends Record<string, unknown> {
  id: number;
  name: string;
  description: string;
  price: number;
  brandId?: number;
  brandName: string;
  categoryId?: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  stockQuantity?: number;
  thumbnailUrl?: string;
  storeName?: string;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  images: ProductImage[];
}

export interface PaginatedProductsResponse<T = Product> {
  items: T[];
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
  StockQuantity = 4
}

