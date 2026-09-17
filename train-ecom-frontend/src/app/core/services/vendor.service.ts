import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { VendorListResponse } from '../models/vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private http = inject(HttpClient);
  private listAPI = `${environment.apiBaseUrl}/admin/vendors/all`;

  constructor() {}

  getVendors(filter?: {
    search?: string;
    status?: string;
    pageNumber?: number;
    pageSize: number;
  }): Observable<VendorListResponse> {
    let params = new HttpParams();

    if (filter?.search) {
      params = params.set('Search', filter.search);
    }
    if (filter?.status) {
      params = params.set('Status', filter.status);
    }

    if (filter?.pageNumber) {
      params = params.set('PageSize', filter.pageNumber);
    }
    if (filter?.pageSize) {
      params = params.set('PageSize', filter.pageSize);
    }

    return this.http.get<VendorListResponse>(this.listAPI, { params });
  }
}
