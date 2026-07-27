import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseApi = `${environment.apiBaseUrl}/categories`;
  private http = inject(HttpClient);

  constructor() { }

  getAllCategories() {
    return this.http.get<Category[]>(`${this.baseApi}/all`);
  }

  getCategoryById(id: string) {
    return this.http.get<Category>(`${this.baseApi}/getById/${id}`);
  }

  createCategory(payload: CreateCategoryRequest) {
    return this.http.post<Category>(`${this.baseApi}/create`, payload);
  }

  updateCategory(id: string, payload: UpdateCategoryRequest) {
    return this.http.put<Category>(`${this.baseApi}/update/${id}`, payload);
  }

  deleteCategory(id: string) {
    return this.http.delete<void>(`${this.baseApi}/delete/${id}`);
  }

}