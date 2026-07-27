import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BuyNowRequest, CreateOrderRequest, CreateOrderResponse, OrderListItem } from '../models/order.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

   private baseAPI = `${environment.apiBaseUrl}/orders`;
   private http = inject(HttpClient);

  constructor() { }

  placeCartOrder(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.baseAPI, payload);
  }

  placeDirectOrder(payload: BuyNowRequest): Observable<CreateOrderResponse> {
    const directOrderAPI = `${this.baseAPI}/direct`;
    return this.http.post<CreateOrderResponse>(directOrderAPI, payload);
  }

  getOrderHistory(): Observable<OrderListItem[]> {
    return this.http.get<OrderListItem[]>(`${this.baseAPI}/history`);
  }

}
