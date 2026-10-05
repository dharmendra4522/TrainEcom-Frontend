import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { map } from 'rxjs/operators';
import { PaginatedProductsResponse } from '../models/product.model';
import { HttpParams } from '@angular/common/http';
import { PortalKey } from '../config/management-access.config';
import { MANAGEMENT_API_PATHS } from '../config/management-api.config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseAPI = `${environment.apiBaseUrl}/products`;
  private http = inject(HttpClient);

  constructor() { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<PaginatedProductsResponse>(`${this.baseAPI}`).pipe(
      map((response) => response?.items || (Array.isArray(response) ? response : []))
    );
  }

  private getBaseApi(portal?: PortalKey): string {
    return portal
      ? `${environment.apiBaseUrl}${MANAGEMENT_API_PATHS[portal].products}`
      : this.baseAPI;
  }

  createProduct(productData: Partial<Product>, files: File[], portal?: PortalKey): Observable<Product> {
    const formData = new FormData();

    formData.append('Name', productData.name || '');
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price?.toString() || '0');
    formData.append('stockQuantity', productData.stockQuantity?.toString() || '0');
    formData.append('BrandId', String(productData.brandId ?? ''));
    formData.append('CategoryId', String(productData.categoryId ?? ''));
    formData.append('SubCategoryId', productData.subCategoryId?.toString() ?? '');

    files.forEach((file) => {
      if (file) formData.append('Images', file);
    });

    return this.http.post<Product>(`${this.getBaseApi(portal)}/create`, formData);
  }

  getProductById(productId: string, portal?: PortalKey): Observable<Product> {
    return this.http.get<Product>(`${this.getBaseApi(portal)}/getById/${productId}`);
  }

  updateProduct(
    productId: string,
    productData: Partial<Product>,
    newFiles: File[] = [],
    deletedImageIds: Array<string | number> = [],
    portal?: PortalKey,
  ): Observable<Product> {
    const formData = new FormData();

    formData.append('Name', productData.name || '');
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price?.toString() || '0');
    formData.append('StockQuantity', productData.stockQuantity?.toString() || '0');
    formData.append('BrandId', String(productData.brandId ?? ''));
    formData.append('CategoryId', String(productData.categoryId ?? ''));
    formData.append('SubCategoryId', productData.subCategoryId?.toString() ?? '');

    deletedImageIds.forEach((id) => {
      formData.append('DeletedImageIds', String(id));
    });

    newFiles.forEach((file) => {
      if (file) {
        formData.append('NewImages', file, file.name);
      }
    });

    return this.http.put<Product>(`${this.getBaseApi(portal)}/update/${productId}`, formData);
  }

  deleteProduct(productId: string, portal?: PortalKey): Observable<void> {
    return this.http.delete<void>(`${this.getBaseApi(portal)}/delete/${productId}`);
  }

  getPaginatedProducts(
    pageNumber: number = 1,
    pageSize: number = 10,
    brandName?: string,
    categoryName?: string,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    minRating?: number,
    portal?: PortalKey,
  ): Observable<PaginatedProductsResponse> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (brandName) {
      params = params.set('BrandName', brandName);
    }
    if (categoryName) {
      params = params.set('CategoryName', categoryName);
    }
    if (search) {
      params = params.set('Search', search);
    }
    if (minPrice !== undefined && minPrice !== null) {
      params = params.set('MinPrice', minPrice.toString());
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      params = params.set('MaxPrice', maxPrice.toString());
    }
    if (sortBy) {
      params = params.set('SortBy', sortBy);
    }
    if (minRating !== undefined && minRating !== null) {
      params = params.set('MinRating', minRating.toString());
    }

    return this.http.get<PaginatedProductsResponse>(this.getBaseApi(portal), { params });
  }


  getFilteredProducts(brandName?: string, categoryName?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (brandName) {
      params = params.set('BrandName', brandName);
    }
    if (categoryName) {
      params = params.set('CategoryName', categoryName);
    }
    return this.http.get<PaginatedProductsResponse>(this.baseAPI, { params }).pipe(
      map((response) => response?.items || [])
    );
  }

  getRelatedProducts(productId: string): Observable<Product[]> {
    return this.http.get<PaginatedProductsResponse>(`${this.baseAPI}/${productId}/related`).pipe(
    map((response) => response?.items || (Array.isArray(response) ? response : []))
  );
  }

}
