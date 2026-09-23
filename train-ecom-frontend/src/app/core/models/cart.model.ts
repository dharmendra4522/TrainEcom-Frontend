export interface CartItem {
    itemId?: number | string;
    productId: number | string;
    productName: string;
    unitPrice: number;
    quantity: number;
    thumbnailUrl?: string;
}

export interface CartProductDetails {
    productName: string;
    unitPrice: number;
    thumbnailUrl?: string;
    image?: string;
}

export interface CartWarning {
    productId: number | string;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
    message: string;
}

export interface CartResponse {
    message?: string;
    items: CartItem[];
    warnings?: CartWarning[];
    totalQuantity: number;
    totalAmount: number;
}

export interface MergeCartItemRequest {
    productId: number | string;
    quantity: number;
}

export interface MergeCartRequest {
    items: MergeCartItemRequest[];
}
