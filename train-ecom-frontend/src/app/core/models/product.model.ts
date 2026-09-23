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
}


export interface ProductFilterPayload {
  searchQuery: string;
  categoryId: number | string;
  brandId: number | string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: string;
}
