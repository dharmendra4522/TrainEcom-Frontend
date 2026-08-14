export interface NotificationItem {
    id: string;
    type: NotificationType | string;
    title: string;
    message: string;
    referenceId: string | null;
    referenceType: string | null;
    isRead: boolean;
    readAt: string | null;
    isBroadcast: boolean;
    createdAt: string;
    isHidden: boolean;
    time?: string;
    actionUrl?: string;
    actionText?: string;
}

export enum NotificationType {
    Welcome = "Welcome",
    OrderPlaced = "OrderPlaced",
    OrderConfirmed = "OrderConfirmed",
    OrderProcessing = "OrderProcessing",
    OrderShipped = "OrderShipped",
    OrderDelivered = "OrderDelivered",
    OrderCancelled = "OrderCancelled",
    PaymentSuccessful = "PaymentSuccessful",
    PaymentFailed = "PaymentFailed",
    NewOrderPlaced = "NewOrderPlaced",
    PaymentReceived = "PaymentReceived",
    AdminOrderCancelled = "AdminOrderCancelled",
    LowStock = "LowStock",
    ProductOutOfStock = "ProductOutOfStock",
    NewCustomerRegistered = "NewCustomerRegistered",
    NewProductReview = "NewProductReview",
    AdminBroadcast = "AdminBroadcast"
}


export interface NotificationResponse {
    items: NotificationItem[];
    unreadCount: number;
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}