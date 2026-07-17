export interface Product {
    id: string;
    name: string;
    description: string;
    categoryName: string;
    price: number;
    StockQuantity: number;
    thumbnailUrl: string | null;
    brandName: string;
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