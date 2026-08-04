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


  constructor() { }

  getAllOrderHistory(filter?: OrderHistoryFilterParams): Observable<OrderHistoryResponse> {
    let params = new HttpParams();
    if (filter) {
      if (filter.search) {
        params = params.set('search', filter.search.trim());
      }
      if (filter.fromDate) {
        params = params.set('fromDate', filter.fromDate);
      }
      if (filter.toDate) {
        params = params.set('toDate', filter.toDate);
      }
      if (filter.orderStatus) {
        params = params.set('orderStatus', filter.orderStatus);
      }
      if (filter.pageNumber !== undefined) {
        params = params.set('pageNumber', filter.pageNumber.toString());
      }
      if (filter.pageSize !== undefined) {
        params = params.set('pageSize', filter.pageSize.toString());
      }
    }
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
    let params = new HttpParams();
    if (filter) {
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.orderStatus) {
        params = params.set('orderStatus', filter.orderStatus);
      }
      if (filter.paymentStatus) {
        params = params.set('paymentStatus', filter.paymentStatus);
      }
      if (filter.fromDate) {
        params = params.set('fromDate', filter.fromDate);
      }
      if (filter.toDate) {
        params = params.set('toDate', filter.toDate);
      }
      if (filter.pageNumber !== undefined) {
        params = params.set('pageNumber', filter.pageNumber.toString());
      }
      if (filter.pageSize !== undefined) {
        params = params.set('pageSize', filter.pageSize.toString());
      }
    }
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
