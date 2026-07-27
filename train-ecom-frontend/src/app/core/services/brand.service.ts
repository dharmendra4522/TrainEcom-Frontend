import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand, CreateBrandRequest } from '../models/brand.model';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private baseApi = `${environment.apiBaseUrl}/brands`;
  private http = inject(HttpClient);

  constructor() {}

  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseApi}/all`);
  }

  getBrandById(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.baseApi}/${id}`);
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
