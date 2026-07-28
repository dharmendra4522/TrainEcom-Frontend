import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Brand, CreateBrandRequest, PaginatedBrandResponse } from '../models/brand.model';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private baseApi = `${environment.apiBaseUrl}/brands`;
  private http = inject(HttpClient);

  constructor() { }

  getAllBrands(): Observable<PaginatedBrandResponse> {
    return this.http.get<any>(`${this.baseApi}/all`).pipe(
      catchError(() => this.http.get<any>(this.baseApi)),
      catchError(() => this.http.get<any>(`${this.baseApi}/getAll`)),
      map((response) => {
        if (Array.isArray(response)) {
          return {
            items: response,
            pageNumber: 1,
            pageSize: response.length,
            totalRecords: response.length,
            totalPages: 1,
          };
        }
        if (response && Array.isArray(response.items)) {
          return {
            items: response.items,
            pageNumber: response.pageNumber || 1,
            pageSize: response.pageSize || response.items.length,
            totalRecords: response.totalRecords ?? response.items.length,
            totalPages: response.totalPages || 1,
          };
        }
        return {
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalRecords: 0,
          totalPages: 1,
        };
      })
    );
  }

  getBrandById(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.baseApi}/${id}`).pipe(
      catchError(() => this.http.get<Brand>(`${this.baseApi}/getById/${id}`))
    );
  }

  createBrand(payload: CreateBrandRequest): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseApi}/create`, payload);
  }

  updateBrand(id: string, payload: CreateBrandRequest): Observable<Brand> {
    return this.http.put<Brand>(`${this.baseApi}/update/${id}`, payload);
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApi}/delete/${id}`);
  }
}
