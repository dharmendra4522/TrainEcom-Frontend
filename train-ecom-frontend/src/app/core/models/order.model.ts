import { PaymentMethod, OrderStatus, PaymentStatus } from './checkout.model';
import { OrderItemReviewSummary } from './review.model';

export { PaymentMethod, OrderStatus, PaymentStatus };

export interface OrderListItem extends Record<string, unknown> {
  orderId: number | string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalItems: number;
}

export interface AdminOrderItem extends Record<string, unknown> {
  orderId: number | string;
  customerName: string;
  totalAmount: number;
  totalItems: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderItem[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

export interface AdminOrderFilterParams {
  search?: string;
  orderStatus?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface OrderHistoryItem {
  orderId: number | string;
  orderName: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalItems: number;
  thumbnailUrl?: string;
}

export interface OrderHistoryResponse {
  items: OrderHistoryItem[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface OrderHistoryFilterParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  orderStatus?: OrderStatus | string;
  pageNumber?: number;
  pageSize?: number;
}

export interface OrderItemDetail {
  productId: number | string;
  productName: string;
  thumbnailUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reviewSummary?: OrderItemReviewSummary;
}

export interface DeliveryAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetail {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
}

export interface OrderDetailsResponse {
  orderId: number | string;
  orderDate: string;
  orderStatus: OrderStatus;
  remark?: string | null;
  items: OrderItemDetail[];
  totalItems: number;
  deliveryAddress: DeliveryAddress;
  payment: PaymentDetail;
  priceSummary: {
    totalAmount: number;
  };
  canCancel: boolean;
  customerDetail?: {
    customerName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface OrderTrackingStep {
  status: OrderStatus;
  completed: boolean;
  statusDate?: string | null;
  remarks?: string | null;
}

export interface OrderTrackingResponse {
  orderId: number | string;
  currentStatus: string;
  trackingSteps: OrderTrackingStep[];
}

export interface UpdateOrderStatusResponse {
  orderId: number | string;
  orderStatus: OrderStatus;
  message: string;
}
