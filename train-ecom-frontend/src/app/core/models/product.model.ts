export interface Product {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    images: string[];
    brand: string;
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