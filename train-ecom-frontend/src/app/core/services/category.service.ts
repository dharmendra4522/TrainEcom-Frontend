import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Category, CreateCategoryRequest, PaginatedCategoryResponse, UpdateCategoryRequest } from '../models/category.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseApi = `${environment.apiBaseUrl}/categories`;
  private http = inject(HttpClient);

  constructor() { }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[] | PaginatedCategoryResponse>(`${this.baseApi}/all`).pipe(
      map((response) => Array.isArray(response) ? response : response?.items || []),
    );
  }

  getPaginatedCategories(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Observable<PaginatedCategoryResponse> {
    const params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<PaginatedCategoryResponse | Category[]>(`${this.baseApi}/all`, { params }).pipe(
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

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseApi}/getById/${id}`);
  }

  createCategory(payload: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseApi}/create`, payload);
  }

  updateCategory(id: string, payload: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseApi}/update/${id}`, payload);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseApi}/delete/${id}`);
  }

}
