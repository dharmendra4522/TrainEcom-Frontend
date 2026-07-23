export interface WishListItem {
    productId: string;
    productName: string;
    thumbnailUrl: string;
    price: number;
    description: string;
    brandName: string;
    categoryName: string;
    stockQuantity: number;
    addedAt: string;
    quantity?: number;
    id: string;
    name: string;
    image?: string;
}

export interface WishlistApiResponse {
    success: boolean;
    message: string;
    result: {
        totalItems: number;
        items: WishListItem | WishListItem[];
    };
}

export interface WishlistActionResponse {
    wishlistId: string;
    productId: string;
    addedAt: string;
}