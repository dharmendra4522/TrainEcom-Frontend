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
  private baseAPI = `${environment.apiBaseUrl}/dashboard/data`;
  private chartAPI = `${environment.apiBaseUrl}/dashboard`;
  private vendorAPI = `${environment.apiBaseUrl}/vendors/list/all`;

  constructor() { }

  fetchDashboardMetricsData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.baseAPI);
  }

  fetchCategoryWiseProductCount(): Observable<CategoryProductSummaryResponse> {
    return this.http.get<CategoryProductSummaryResponse>(this.chartAPI + '/product-category/summary');
  }

  fetchRevenueData(
    year?: number,
    vendorIds?: number[],
    fromDate?: Date | null,
    toDate?: Date | null
  ): Observable<RevenueData> {
    let params = new HttpParams();
    if (year !== undefined && year !== null) {
      params = params.set('year', year.toString());
    }
    if (vendorIds?.length) {
      vendorIds.forEach((id) => {
        params = params.append('vendorIds', id.toString());
      });
    }
    if (fromDate) {
      params = params.set('FromDate', this.formatDate(fromDate));
    }
    if (toDate) {
      params = params.set('ToDate', this.formatDate(toDate));
    }
    return this.http.get<RevenueData>(this.chartAPI + '/sales-overview/summary', { params });
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
  fetchOrderSummary(
    year?: number,
    vendorIds?: number[],
    fromDate?: Date | null,
    toDate?: Date | null
  ): Observable<OrderSummaryResponse> {
    let params = new HttpParams();
    if (year !== undefined && year !== null) {
      params = params.set('year', year.toString());
    }
    if (vendorIds?.length) {
      vendorIds.forEach(id => {
        params = params.append('vendorIds', id.toString());
      });
    }
    if (fromDate) {
      params = params.set('FromDate', this.formatDate(fromDate));
    }
    if (toDate) {
      params = params.set('ToDate', this.formatDate(toDate));
    }
    return this.http.get<OrderSummaryResponse>(this.chartAPI + '/order/summary', { params });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}