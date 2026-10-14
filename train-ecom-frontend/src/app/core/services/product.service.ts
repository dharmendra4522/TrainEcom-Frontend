import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductListFilters } from '../models/product.model';
import { map } from 'rxjs/operators';
import { PaginatedProductsResponse } from '../models/product.model';
import { HttpParams } from '@angular/common/http';
import { PortalKey } from '../config/management-access.config';
import { MANAGEMENT_API_PATHS } from '../config/management-api.config';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseAPI = `${environment.apiBaseUrl}/products`;
  private http = inject(HttpClient);

  constructor() { }

  getAllProducts(): Observable<Product[]> {
    return this.http
      .get<PaginatedProductsResponse>(`${this.baseAPI}`)
      .pipe(map((response) => response.items ?? []));
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

  getProductById(productId: number, portal?: PortalKey): Observable<Product> {
    return this.http.get<Product>(
      `${this.getBaseApi(portal)}/getById/${productId}`
    );
  }

  updateProduct(
    productId: number,
    productData: Partial<Product>,
    newFiles: File[] = [],
    deletedImageIds: Array<string | number> = [],
    portal?: PortalKey
  ): Observable<Product> {
    const formData = new FormData();

    formData.append('Name', productData.name || '');
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price?.toString() || '0');
    formData.append(
      'StockQuantity',
      productData.stockQuantity?.toString() || '0',
    );
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

    return this.http.put<Product>(
      `${this.getBaseApi(portal)}/update/${productId}`,
      formData
    );
  }

  deleteProduct(productId: number, portal?: PortalKey): Observable<void> {
    return this.http.delete<void>(
      `${this.getBaseApi(portal)}/delete/${productId}`
    );
  }

  getPaginatedProducts(
    filters: ProductListFilters = {}
  ): Observable<PaginatedProductsResponse> {
    const {
      pageNumber = 1,
      pageSize = 10,
      search,
      searchField,
      requestField,
      categoryIds,
      subCategoryIds,
      brandIds,
      storeName,
      minStock,
      maxStock,
      minPrice,
      maxPrice,
      sortBy,
      minRating,
      filterIds,
      portal
    } = filters;

    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    if (search) {
      params = params.set('Search', search);
    }

    if (searchField) {
      params = params.set('SearchField', searchField.toString());
    }

    if (requestField) {
      params = params.set('RequestField', requestField.toString());
    }

    categoryIds?.forEach((id) => {
      params = params.append('CategoryIds', id.toString());
    });

    subCategoryIds?.forEach((id) => {
      params = params.append('SubCategoryIds', id.toString());
    });

    brandIds?.forEach((id) => {
      params = params.append('BrandIds', id.toString());
    });

    filterIds?.forEach((id) => {
      params = params.append('FilterIds', id.toString());
    });

    if (storeName) {
      params = params.set('StoreName', storeName);
    }

    if (minStock !== undefined) {
      params = params.set('MinStock', minStock.toString());
    }

    if (maxStock !== undefined) {
      params = params.set('MaxStock', maxStock.toString());
    }

    if (minPrice !== undefined) {
      params = params.set('MinPrice', minPrice.toString());
    }

    if (maxPrice !== undefined) {
      params = params.set('MaxPrice', maxPrice.toString());
    }

    if (sortBy) {
      params = params.set('SortBy', sortBy);
    }

    if (minRating !== undefined) {
      params = params.set('MinRating', minRating.toString());
    }

    return this.http.get<PaginatedProductsResponse>(this.getBaseApi(portal), {
      params
    });
  }

  getRelatedProducts(productId: number): Observable<Product[]> {
    return this.http
      .get<PaginatedProductsResponse | Product[]>(
        `${this.baseAPI}/${productId}/related`,
      )
      .pipe(
        map((response) =>
          Array.isArray(response) ? response : response.items ?? []
        )
      );
  }
}
