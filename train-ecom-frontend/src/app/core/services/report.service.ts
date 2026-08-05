import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { topProducts } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = environment.apiBaseUrl;
  private http = inject(HttpClient);


  // Generates a sales report in PDF format for the specified date range.
  generateSalesReport(fromDate: string, toDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);
   return this.http.get(`${this.apiUrl}/admin/reports/sales`, {
      params,
      responseType: 'blob'
    });
  }

    getTopSellingProducts(fromdate?: string, todate?: string, limit: number = 10): Observable<topProducts[]> {
     let params = new HttpParams().set('limit', limit.toString());
      if(fromdate) {
        params = params.set('fromDate', fromdate);
      }
      if(todate) {
        params = params.set('toDate', todate);
      }
      return this.http.get<topProducts[]>(`${this.apiUrl}/admin/top-products`, { params });
    }

}
