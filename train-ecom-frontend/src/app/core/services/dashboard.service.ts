import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CategoryProductSummaryResponse, DashboardData, OrderSummaryResponse, RevenueData, VendorItem } from '../models/dashboard.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  private baseAPI = `${environment.apiBaseUrl}/admin/dashboard`
  private vendorMetrices = `${environment.apiBaseUrl}/vendors/dashboard/metrices`;
  private chartAPI = `${environment.apiBaseUrl}/dashboard`;
  private vendorAPI = `${environment.apiBaseUrl}/vendors/list/all`;


  constructor() { }

  fetchDashboardMetricsData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.baseAPI);
  }

  fetchVendorDashboardMetricsData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.vendorMetrices);
  }

  fetchCategoryWiseProductCount(): Observable<CategoryProductSummaryResponse> {
    return this.http.get<CategoryProductSummaryResponse>(this.chartAPI + '/product-category/summary');
  }

  fetchRevenueData(year?: number, vendorIds?: number[]): Observable<RevenueData> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    if (vendorIds && vendorIds.length > 0) {
      vendorIds.forEach((id) => {
        params = params.append('vendorIds', id.toString());
      });
    }
    return this.http.get<RevenueData>(this.chartAPI + '/sales-overview/monthly', { params });
  }

  // fetch the list of all vendors for the filter dropdown in the revenue chart
  fetchVendorList(search?: string): Observable<VendorItem[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<VendorItem[]>(this.vendorAPI, { params });
  }


  // fetch the order summary data for the order status chart
  fetchOrderSummary(year?: number, vendorIds?: number[]): Observable<OrderSummaryResponse> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    if (vendorIds && vendorIds.length > 0) {
      vendorIds.forEach(id => {
        params = params.append('vendorIds', id.toString());
      });
    }
    return this.http.get<OrderSummaryResponse>(this.chartAPI + '/order/summary', { params });
  }
}