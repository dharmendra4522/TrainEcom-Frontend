export enum PaymentMethod {
  CashOnDelivery = 'CashOnDelivery',
  Card = 'Card',
  UPI = 'UPI',
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
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

export interface CheckoutItem {
  itemId?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  thumbnailUrl?: string;
}
