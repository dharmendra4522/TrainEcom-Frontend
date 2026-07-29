import { PaymentMethod, PaymentStatus, OrderStatus } from './order.model';


export interface OrderHistoryItem {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalItems: number;
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