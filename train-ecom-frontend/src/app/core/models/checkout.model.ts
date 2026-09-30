export enum PaymentMethod {
  CashOnDelivery = 1,
  Card = 2,
  UPI = 3,
}


export enum OrderStatus {
   Active=1,

    Shipped =2,

    Delivered=3,

    Cancelled=4  
}


export enum PaymentStatus {
  Pending = 1,
  Success = 2,
  Refunded = 3,
  Cancelled = 4
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
  addressId: number | string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface BuyNowRequest {
  addressId: number | string;
  productId: number | string;
  quantity: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface CreateOrderResponse {
  orderId: number | string;
  orderStatus: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
}

export interface CheckoutItem {
  itemId?: number | string;
  productId: number | string;
  productName: string;
  unitPrice: number;
  quantity: number;
  thumbnailUrl?: string;
}

export interface ValidateCheckoutItem {
  productId: number | string;
  productName: string;
  cartQuantity: number;
  availableStock: number;
  isAvailable: boolean;
  message?: string | null;
}

export interface ValidateCheckoutResponse {
  isValid: boolean;
  items: ValidateCheckoutItem[];
}
