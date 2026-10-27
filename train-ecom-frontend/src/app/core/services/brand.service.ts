import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Brand, BrandListField, CreateBrandRequest, PaginatedBrandResponse } from '../models/brand.model';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly baseApi = `${environment.apiBaseUrl}/brands`;
  private http = inject(HttpClient);

  // Fetch all brands without pagination
  getAllBrands(): Observable<Brand[]> {
    return this.http.get<PaginatedBrandResponse>(`${this.baseApi}/all`).pipe(
      map((response) => response.items)
    )
  }

  // Fetch paginated brands with optional search and search field
  getPaginatedBrands(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    searchField?: BrandListField,
    requestField?: BrandListField
  ): Observable<PaginatedBrandResponse> {
    let params = new HttpParams()
      .set('pageNumber', `${pageNumber}`)
      .set('pageSize', `${pageSize}`);

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    if (searchField !== undefined) {
      params = params.set('searchField', searchField);
    }
    if (requestField !== undefined) {
      params = params.set('requestField', requestField);
    }
    return this.http.get<PaginatedBrandResponse>(
      `${this.baseApi}/all`,
      { params }
    );
  }

  // Fetch a brand by ID 
  getBrandById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.baseApi}/getById/${id}`);
  }

  // Create a new brand
  createBrand(payload: CreateBrandRequest): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseApi}/create`, payload);
  }

  // Update an existing brand
  updateBrand(id: number, payload: CreateBrandRequest): Observable<Brand> {
    return this.http.put<Brand>(`${this.baseApi}/update/${id}`, payload);
  }

  // Delete a brand by ID
  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApi}/delete/${id}`);
  }
}
