export interface ProductImage {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
}

export interface Product {
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
    images: ProductImage[];

}

export interface PaginatedProductsResponse {
    items: Product[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface Brand {
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

export interface Category {
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