export interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Product extends Record<string, unknown> {
  id: string | number;
  name: string;
  description: string;
  price: number;
  brandId?: string;
  brandName: string;
  categoryId?: string;
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
  categoryId: string;
  brandId: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: string;
}
