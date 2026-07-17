import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseAPI = `${environment.apiBaseUrl}/products`;
  private http = inject(HttpClient);

  constructor() { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseAPI}/all`);
  }

  createProduct(productData: any, files: File[]): Observable<Product> {
    const formData = new FormData();

    formData.append('Name', productData.title);
    formData.append('Description', productData.description);
    formData.append('Price', productData.price.toString());
    formData.append('Stock', productData.stock.toString());
    formData.append('BrandId', productData.brand); 
    formData.append('CategoryId', productData.category); 

    files.forEach((file) => {
      if (file) formData.append('Images', file);
    });

    return this.http.post<Product>(`${this.baseAPI}/create`, formData);
  }

}
