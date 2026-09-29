import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CategoryWiseProductCount, DashboardData, RevenueData } from '../models/dashboard.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  private baseAPI = `${environment.apiBaseUrl}/admin/dashboard`
  private chartAPI = `${environment.apiBaseUrl}/dashboard`;

  constructor() { }

  fetchDashboardMetricsData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.baseAPI);
  }

  fetchCategoryWiseProductCount(): Observable<CategoryWiseProductCount[]> {
    return this.http.get<CategoryWiseProductCount[]>(this.chartAPI + '/product-category/summary');
  }

  fetchRevenueData(year?: number): Observable<RevenueData> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<RevenueData>(this.chartAPI + '/sales-overview/monthly', { params });
  }

}

