import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[] | PaginatedBrandResponse>(`${this.baseApi}/all`).pipe(
      catchError(() => this.http.get<Brand[] | PaginatedBrandResponse>(this.baseApi)),
      catchError(() => this.http.get<Brand[] | PaginatedBrandResponse>(`${this.baseApi}/getAll`)),
      map((response) => Array.isArray(response) ? response : response?.items || [])
    );
  }

  getPaginatedBrands(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedBrandResponse> {
    const params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<PaginatedBrandResponse | Brand[]>(`${this.baseApi}/all`, { params }).pipe(
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

        return {
          items: response?.items || [],
          pageNumber: response?.pageNumber || pageNumber,
          pageSize: response?.pageSize || pageSize,
          totalRecords: response?.totalRecords ?? response?.items?.length ?? 0,
          totalPages: response?.totalPages || 1,
        };
      }),
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
