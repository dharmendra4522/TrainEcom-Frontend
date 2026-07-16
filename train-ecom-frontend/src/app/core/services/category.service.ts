import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Brand, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseApi = `${environment.apiBaseUrl}/categories`;
  private http = inject(HttpClient);

  constructor() { }

  getAllCategories(){
    return this.http.get<Category[]>(`${this.baseApi}/all`);
  }

  getCategoryById(id: number){
    return this.http.get<Category>(`${this.baseApi}/${id}`);
  }

  createCategory(payload: CreateCategoryRequest){
    return this.http.post<Category>(`${this.baseApi}`, payload);
  }

  updateCategory(id: number, payload: UpdateCategoryRequest){
    return this.http.put<Category>(`${this.baseApi}/${id}`, payload);
  }

  deleteCategory(id: number){
    return this.http.delete<void>(`${this.baseApi}/${id}`);
  }

}
