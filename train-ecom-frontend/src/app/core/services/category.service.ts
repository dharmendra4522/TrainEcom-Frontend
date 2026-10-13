import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Category,
  CategoryListField,
  CreateCategoryRequest,
  PaginatedCategoryResponse,
  PaginatedSubCategoryResponse,
  SubCategoryList,
  SubCategoryListField,
  UpdateCategoryRequest
} from '../models/category.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseApi = `${environment.apiBaseUrl}/categories`;
  private http = inject(HttpClient);

  constructor() { }

  getAllCategories(): Observable<Category[]> {
    return this.http
      .get<Category[] | PaginatedCategoryResponse>(`${this.baseApi}/all`)
      .pipe(
        map((response) =>
          Array.isArray(response) ? response : response?.items || [],
        ),
      );
  }

  getPaginatedCategories(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    searchField?: CategoryListField
  ): Observable<PaginatedCategoryResponse> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (search && search.trim() !== '') {
      params = params.set('Search', search.trim());
    }
    if (searchField !== undefined) {
      params = params.set(
        'SearchField',
        searchField.toString()
      );
    }

    return this.http
      .get<
        PaginatedCategoryResponse | Category[]
      >(`${this.baseApi}/parentCategory/all`, { params })
      .pipe(
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
            totalRecords:
              response?.totalRecords ?? response?.items?.length ?? 0,
            totalPages: response?.totalPages || 1,
          };
        }),
      );
  }

  getCategoryById(id: string | number): Observable<Category> {
    return this.http.get<Category>(`${this.baseApi}/getById/${String(id)}`);
  }

  createCategory(payload: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseApi}/create`, payload);
  }

  updateCategory(
    id: string | number,
    payload: UpdateCategoryRequest,
  ): Observable<Category> {
    return this.http.put<Category>(
      `${this.baseApi}/update/${String(id)}`,
      payload,
    );
  }

  deleteCategory(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseApi}/delete/${String(id)}`);
  }

  // fetch sub-categories with optional search and parent category filter
  fetchSubCategories(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    parentCategoryIds?: number[] | number | string,
    searchField?: SubCategoryListField,
  ): Observable<PaginatedSubCategoryResponse> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (search && search.trim() !== '') {
      params = params.set('Search', search.trim());
    }
    if (searchField !== undefined) {
      params = params.set(
        'SearchField',
        searchField.toString()
      );
    }
    const selectedParentCategoryIds: (number | string)[] | undefined =
      typeof parentCategoryIds === 'number'
        ? [parentCategoryIds]
        : typeof parentCategoryIds === 'string'
          ? [parentCategoryIds]
        : parentCategoryIds;

    selectedParentCategoryIds?.forEach((parentCategoryId) => {
      params = params.append('ParentCategoryIds', parentCategoryId.toString());
    });

    return this.http
      .get<
        PaginatedSubCategoryResponse | SubCategoryList[]
      >(`${this.baseApi}/subCategories/all`, { params })
      .pipe(
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
            totalRecords:
              response?.totalRecords ?? response?.items?.length ?? 0,
            totalPages: response?.totalPages || 1,
          };
        }),
      );
  }
}
