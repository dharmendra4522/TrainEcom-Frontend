export enum PaymentMethod {
  CashOnDelivery = 'CashOnDelivery',
  Card = 'Card',
  UPI = 'UPI',
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Confirmed = 'Confirmed',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Success = 'Success',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',

}

export interface PaymentSimulationRequest {
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface PaymentSimulationResponse {
  transactionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string;
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}


export interface BuyNowRequest {
  addressId: string;
  productId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}


export interface OrderListItem extends Record<string, unknown> {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalItems: number;
}


export interface CheckoutItem {
  itemId?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  thumbnailUrl?: string;
}

export interface AdminOrderItem extends Record<string, unknown> {
  orderId: string;
  customerName: string;
  totalAmount: number;
  totalItems: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
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