import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseApi = `${environment.apiBaseUrl}/admin/reports`;
  private http = inject(HttpClient);


  // Generates a sales report in PDF format for the specified date range.
  generateSalesReport(fromDate: string, toDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    return this.http.get(`${this.baseApi}/sales`, {
      params,
      responseType: 'blob'
    });
  }
}
