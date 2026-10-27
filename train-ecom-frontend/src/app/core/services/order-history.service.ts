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
  OrderStatus,
  OrderTrackingResponse,
  UpdateOrderStatusResponse
} from '../models/order.model';
import { PortalKey } from '../config/management-access.config';
import { MANAGEMENT_API_PATHS } from '../config/management-api.config';
@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private baseAPI = `${environment.apiBaseUrl}/orders`;

  private http = inject(HttpClient);

  // helper function that builds HttpParams from a filter object, ensuring that only defined properties are included in the request
  private buildParams<T extends object>(filter?: T): HttpParams {
    let params = new HttpParams();
    if (!filter) return params;
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== null && item !== undefined && item !== '') {
              params = params.append(key, item);
            }
          });
        } else {
          params = params.set(key, value);
        }
      }
    });
    return params;
  }

  getAllOrderHistory(filter?: OrderHistoryFilterParams): Observable<OrderHistoryResponse> {
    const params = this.buildParams(filter);
    return this.http.get<OrderHistoryResponse>(`${this.baseAPI}/history`, { params });
  }

  getOrderDetails(orderId: number): Observable<OrderDetailsResponse> {
    return this.http.get<OrderDetailsResponse>(`${this.baseAPI}/history/getById/${orderId}`);
  }

  cancelOrder(orderId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseAPI}/${orderId}/cancel`, {});
  }

  getOrderTracking(orderId: number): Observable<OrderTrackingResponse> {
    return this.http.get<OrderTrackingResponse>(`${this.baseAPI}/${orderId}/tracking`);
  }

  getManagedOrders(
    portal: PortalKey,
    filter?: AdminOrderFilterParams
  ): Observable<AdminOrderListResponse> {
    const params = this.buildParams(filter);
    return this.http.get<AdminOrderListResponse>(
      `${environment.apiBaseUrl}${MANAGEMENT_API_PATHS[portal].orders.list}`,
      { params }
    );
  }

  getManagedOrderDetails(
    portal: PortalKey,
    orderId: number
  ): Observable<OrderDetailsResponse> {
    return this.http.get<OrderDetailsResponse>(
      `${environment.apiBaseUrl}${MANAGEMENT_API_PATHS[portal].orders.detail}/${orderId}`
    );
  }

  updateManagedOrderStatus(
    portal: PortalKey,
    orderId: number,
    status: OrderStatus,
    remark?: string
  ): Observable<UpdateOrderStatusResponse> {
    return this.http.patch<UpdateOrderStatusResponse>(
      `${environment.apiBaseUrl}${MANAGEMENT_API_PATHS[portal].orders.updateStatus}/${orderId}/update-status`,
      { status, remark }
    );
  }

}
