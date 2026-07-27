export enum PaymentMethod {
  CashOnDelivery = 'CashOnDelivery',
  Card = 'Card',
  UPI = 'UPI'
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed'
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
}

export interface BuyNowRequest {
  addressId: string;
  productId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
}

export interface CreateOrderResponse {
  orderId: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}

export interface OrderListItem {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalItems: number;
}