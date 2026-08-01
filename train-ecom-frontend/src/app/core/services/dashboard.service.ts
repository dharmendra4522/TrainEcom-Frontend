import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DashboardData } from '../models/dashboard.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseAPI = `${environment.apiBaseUrl}/admin/dashboard`
  private http = inject(HttpClient);

  constructor() { }

  getDashboardData():Observable<DashboardData> {
    return this.http.get<DashboardData>(this.baseAPI);
  }
}
