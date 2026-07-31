import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BuyNowRequest, CreateOrderRequest, CreateOrderResponse, OrderListItem, PaymentSimulationRequest, PaymentSimulationResponse } from '../models/order.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseAPI = `${environment.apiBaseUrl}/orders`;
  private paymentAPI = `${environment.apiBaseUrl}/payments`;
  private http = inject(HttpClient);

  constructor() { }

  // Simulate online payment (UPI / Card) to get a transactionId
  simulateOnlinePayment(payload: PaymentSimulationRequest): Observable<PaymentSimulationResponse> {
    return this.http.post<PaymentSimulationResponse>(`${this.paymentAPI}/online`, payload);
  }


  //Place cart order (Supports COD and Online via transactionId)
  placeCartOrder(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/cart-checkout`, payload);
  }

  // Place direct order / Buy Now (Supports COD and Online via transactionId)
  placeDirectOrder(payload: BuyNowRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/buy-now`, payload);
  }




  
}
