export interface CartItem {
    itemId?: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    thumbnailUrl?: string;
}

export interface CartWarning {
    productId: string;
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
    productId: string;
    quantity: number;
}

export interface MergeCartRequest {
    items: MergeCartItemRequest[];
}