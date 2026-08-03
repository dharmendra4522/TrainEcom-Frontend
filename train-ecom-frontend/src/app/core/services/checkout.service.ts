import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  BuyNowRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  PaymentSimulationRequest,
  PaymentSimulationResponse,
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
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/cart-checkout`, payload);
  }

  placeDirectOrder(payload: BuyNowRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/buy-now`, payload);
  }
}
