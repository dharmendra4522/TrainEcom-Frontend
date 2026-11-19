export interface WishListItem {
    productId: number;
    productName: string;
    thumbnailUrl: string;
    price: number;
    description: string;
    brandName: string;
    categoryName: string;
    stockQuantity: number;
    addedAt: string;
    quantity?: number;
    id: number;
    name: string;
    image?: string;
    averageRating?: number;
    reviewCount?: number;
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
    wishlistId: number;
    productId: number;
    addedAt: string;
}