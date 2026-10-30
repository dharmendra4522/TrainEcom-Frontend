import { PaymentMethod, OrderStatus, PaymentStatus } from './checkout.model';
import { OrderItemReviewSummary } from './review.model';

export { PaymentMethod, OrderStatus, PaymentStatus };

export interface OrderListItem extends Record<string, unknown> {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalItems: number;
}

export interface AdminOrderItem extends Record<string, unknown> {
  orderId: number;
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
  minOrderAmount?: number;
  maxOrderAmount?: number;
}

export interface AdminOrderFilterParams {
  search?: string;
  searchField?: OrderListField;
  orderStatus?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  orderDate?: string;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface LegacyAdminOrderFilterParams extends AdminOrderFilterParams {
  month?: number;
  year?: number;
}

export interface OrderHistoryItem {
  orderId: number;
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
  orderStatus?: OrderStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface OrderItemDetail {
  productId: number;
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
  orderId: number;
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
  orderId: number;
  currentStatus: string;
  trackingSteps: OrderTrackingStep[];
}

export interface UpdateOrderStatusResponse {
  orderId: number;
  orderStatus: OrderStatus;
  message: string;
}

export enum OrderListField {
  OrderId = 1,
  CustomerName = 2,
  Items = 3
}

export type OrderHistoryViewModel = OrderHistoryItem & {
  orderStatusLabel: string;
  paymentStatusLabel: string;
  orderStatusClass: string;
  paymentStatusClass: string;
  imageUrl: string;
};

export type TrackingStepViewModel = OrderTrackingStep & {
  statusLabel: string;
  isCancelled: boolean;
};

export type TrackingViewModel = OrderTrackingResponse & {
  currentStatusLabel: string;
  trackingSteps: TrackingStepViewModel[];
};