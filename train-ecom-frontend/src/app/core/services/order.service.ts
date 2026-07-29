import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BuyNowRequest, CreateOrderRequest, CreateOrderResponse, OrderListItem } from '../models/order.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseAPI = `${environment.apiBaseUrl}/orders`;
  private http = inject(HttpClient);

  constructor() { }

  placeCartOrder(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/cart`, payload);
  }

  placeDirectOrder(payload: BuyNowRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.baseAPI}/buy-now`, payload);
  }

  getOrderHistory(): Observable<OrderListItem[]> {
    return this.http.get<OrderListItem[]>(this.baseAPI);
  }

  // Admin: Fetch all orders (across all users)
  getAllOrders(): Observable<OrderListItem[]> {
    return this.http.get<OrderListItem[]>(`${this.baseAPI}/all`);
  }
}
