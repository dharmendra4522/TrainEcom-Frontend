import { PaymentMethod, PaymentStatus, OrderStatus } from './order.model';


export interface OrderHistoryItem {
  orderId: string;
  orderName: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalItems: number;
  thumbnailUrl?: string;
}

export interface OrderHistoryResponse{
    items: OrderHistoryItem[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface OrderHistoryFilterParams{
    fromDate?: string;
    toDate?: string;
    orderStatus?: OrderStatus;
    pageNumber?: number;
    pageSize?: number;    
}

export interface OrderItemDetail{
    productId: string;
    productName: string;
    thumbnailUrl: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface DeliveryAddress{
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface PaymentDetail{
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    transactionId?: string;
    paidAt?: string;
}

export interface OrderDetailsResponse{
    orderId: string;
    orderDate: string;
    orderStatus: OrderStatus;
    items: OrderItemDetail[];
    totalItems: number;
    deliveryAddress: DeliveryAddress;
    payment: PaymentDetail;
    priceSummary: {
        totalAmount: number;
    }
    canCancel: boolean;
}

export interface OrderTrackingStep{
    status: OrderStatus;
    completed: boolean;
    statusDate?: string | null;
    remarks?: string | null;
}

export interface OrderTrackingResponse{
    orderId: string;
    currentStatus: string;
    trackingSteps: OrderTrackingStep[];
}