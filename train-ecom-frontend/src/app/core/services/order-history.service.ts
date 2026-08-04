import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminOrderFilterParams,
  AdminOrderListResponse,
  OrderDetailsResponse,
  OrderHistoryFilterParams,
  OrderHistoryResponse,
  OrderTrackingResponse,
  UpdateOrderStatusResponse
} from '../models/order.model';
@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private baseAPI = `${environment.apiBaseUrl}/orders`;

  private http = inject(HttpClient);

// helper function that builds HttpParams from a filter object, ensuring that only defined properties are included in the request
private buildParams<T extends object>(filter?: T): HttpParams {
  let params = new HttpParams();
  if(!filter) return params;

  Object.entries(filter).forEach(([key, value]) => {
    if(value !== null && value !== undefined && value !== '') {
      const stringvalue = typeof value === 'string' ? value.trim() : value.toString();
      params = params.set(key, stringvalue);
    }
  });
  return params;
}

  getAllOrderHistory(filter?: OrderHistoryFilterParams): Observable<OrderHistoryResponse> {
    const params = this.buildParams(filter);
    return this.http.get<OrderHistoryResponse>(`${this.baseAPI}/history`, { params });
  }

  getOrderDetails(orderId: string): Observable<OrderDetailsResponse> {
    return this.http.get<OrderDetailsResponse>(`${this.baseAPI}/history/getById/${orderId}`);
  }

  cancelOrder(orderId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseAPI}/${orderId}/cancel`, {});
  }

  getOrderTracking(orderId: string): Observable<OrderTrackingResponse> {
    return this.http.get<OrderTrackingResponse>(`${this.baseAPI}/${orderId}/tracking`);
  }

  getAdminOrders(filter?: AdminOrderFilterParams): Observable<AdminOrderListResponse> {
    const params = this.buildParams(filter);
    return this.http.get<AdminOrderListResponse>(`${environment.apiBaseUrl}/admin/orders/all`, { params });
  }


  // Admin specific methods for order details and status update
  getAdminOrderDetails(orderId: string): Observable<OrderDetailsResponse> {
    return this.http.get<OrderDetailsResponse>(`${environment.apiBaseUrl}/admin/orders/getById/${orderId}`);
  }

  // Method to update order status for admin 
  updateOrderStatus(orderId: string, status: string, remark?: string): Observable<UpdateOrderStatusResponse> {
    return this.http.patch<UpdateOrderStatusResponse>(
      `${environment.apiBaseUrl}/admin/orders/${orderId}/update-status`,
      { status, remark }
    );
  }

}
