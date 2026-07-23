
export interface CartItem {
    itemId?: string;
    productId: string | number;
    productName: string;
    unitPrice: number;
    quantity: number;
    thumbnailUrl?: string;
}

export interface CartResponse {
    message?: string;
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
}