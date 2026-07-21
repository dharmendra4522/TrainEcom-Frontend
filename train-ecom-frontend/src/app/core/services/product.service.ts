import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { map } from 'rxjs/operators';
import { PaginatedProductsResponse } from '../models/product.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseAPI = `${environment.apiBaseUrl}/products`;
  private http = inject(HttpClient);

  constructor() { }

  getAllProducts(): Observable<Product[]> {
  return this.http.get<PaginatedProductsResponse>(`${this.baseAPI}`).pipe(
    map((response) => response.items)
  );
}

  createProduct(productData: Partial<Product>, files: File[]): Observable<Product> {
    const formData = new FormData();

    formData.append('Name', productData.name || '');
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price?.toString() || '0');
    formData.append('stockQuantity', productData.stockQuantity?.toString() || '0');
    formData.append('BrandId', productData.brandId || '');
    formData.append('CategoryId', productData.categoryId || '');

    files.forEach((file) => {
      if (file) formData.append('Images', file);
    });

    return this.http.post<Product>(`${this.baseAPI}/create`, formData);
  }

  getProductById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseAPI}/getById/${productId}`);
  }

  updateProduct(
    productId: string,
    productData: Partial<Product>,
    newFiles: File[] = [],
    deletedImageIds: string[] = []
  ): Observable<Product> {
    const formData = new FormData();

    formData.append('Name', productData.name || '');
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price?.toString() || '0');
    formData.append('StockQuantity', productData.stockQuantity?.toString() || '0');
    formData.append('BrandId', productData.brandId || '');
    formData.append('CategoryId', productData.categoryId || '');

    deletedImageIds.forEach((id) => {
      formData.append('DeletedImageIds', id);
    });

    newFiles.forEach((file) => {
      if (file) {
        formData.append('NewImages', file, file.name);
      }
    });

    return this.http.put<Product>(`${this.baseAPI}/update/${productId}`, formData);
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseAPI}/delete/${productId}`);
  }

  getPaginatedProducts(pageNumber: number, pageSize: number): Observable<PaginatedProductsResponse> {
    const params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<PaginatedProductsResponse>(`${this.baseAPI}`, { params });
  }
}