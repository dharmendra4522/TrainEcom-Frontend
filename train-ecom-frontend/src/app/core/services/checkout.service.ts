import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  BuyNowRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  PaymentSimulationRequest,
  PaymentSimulationResponse,
  ValidateCheckoutResponse,
} from '../models/checkout.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private baseAPI = `${environment.apiBaseUrl}/orders`;
  private paymentAPI = `${environment.apiBaseUrl}/payments`;
  private http = inject(HttpClient);

  simulateOnlinePayment(payload: PaymentSimulationRequest): Observable<PaymentSimulationResponse> {
    return this.http.post<PaymentSimulationResponse>(`${this.paymentAPI}/online`, payload);
  }

  placeCartOrder(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    const requestPayload = {
      ...payload,
      addressId: Number(payload.addressId),
      paymentMethod: Number(payload.paymentMethod)
    };
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/cart-checkout`, requestPayload);
  }

  placeDirectOrder(payload: BuyNowRequest): Observable<CreateOrderResponse> {
    const requestPayload = {
      ...payload,
      addressId: Number(payload.addressId),
      productId: Number(payload.productId),
      paymentMethod: Number(payload.paymentMethod)
    };
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/buy-now`, requestPayload);
  }

  validateCheckout(): Observable<ValidateCheckoutResponse> {
    return this.http.post<ValidateCheckoutResponse>(`${environment.apiBaseUrl}/validate-checkout`, {});
  }
}
