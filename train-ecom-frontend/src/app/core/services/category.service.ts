import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Category,
  CategoryListField,
  CreateCategoryRequest,
  PaginatedCategoryResponse,
  PaginatedSubCategoryResponse,
  SubCategoryListField,
  UpdateCategoryRequest
} from '../models/category.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseApi = `${environment.apiBaseUrl}/categories`;
  private http = inject(HttpClient);

  // Fetch all categories without pagination
  getAllCategories(): Observable<Category[]> {
    return this.http
      .get<PaginatedCategoryResponse>(`${this.baseApi}/all`)
      .pipe(
        map((response) => response?.items || [])
      );
  }

  // handle paginated categories with optional search and searchField
  getPaginatedCategories(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    searchField?: CategoryListField
  ): Observable<PaginatedCategoryResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (searchField !== undefined) {
      params = params.set('searchField', searchField);
    }
    return this.http.get<PaginatedCategoryResponse>(`${this.baseApi}/parentCategory/all`, { params });
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseApi}/getById/${id}`);
  }

  // Create a new category
  createCategory(payload: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseApi}/create`, payload);
  }

  // Update a category by its ID
  updateCategory(
    id: number,
    payload: UpdateCategoryRequest
  ): Observable<Category> {
    return this.http.put<Category>(
      `${this.baseApi}/update/${id}`,
      payload
    );
  }

  // Delete a category by its ID
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApi}/delete/${id}`);
  }

  // Fetch sub-categories with optional search and parent category filter
  fetchSubCategories(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    parentCategoryIds?: number | number[],
    searchField?: SubCategoryListField
  ): Observable<PaginatedSubCategoryResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    if (searchField !== undefined) {
      params = params.set('searchField', searchField);
    }
    if (parentCategoryIds !== undefined) {
      const ids = Array.isArray(parentCategoryIds) ? parentCategoryIds : [parentCategoryIds];
      ids.forEach((id) => {
        params = params.append('parentCategoryIds', id);
      });
    }

    return this.http.get<PaginatedSubCategoryResponse>(`${this.baseApi}/subCategories/all`, { params });
  }
}
