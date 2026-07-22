import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { WishListItem } from '../models/wishList.model';

@Injectable({
  providedIn: 'root'
})
export class WishListService {

  private baseAPI = `${environment.apiBaseUrl}/wishlist`;
  private http = inject(HttpClient);

  getWishList(): Observable<WishListItem[]> {
    return this.http.get<WishListItem[]>(`${this.baseAPI}/wishlist-items`);
  }

  addToWishlist(productId: string): Observable<WishListItem> {
    return this.http.post<WishListItem>(`${this.baseAPI}/add/products/${productId}`, {});
  }

  removeFromWishlist(productId: string): Observable<WishListItem> {
    return this.http.delete<WishListItem>(`${this.baseAPI}/delete/products/${productId}`);
  }

  checkInWishlist(productId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseAPI}/products/${productId}/status`);
  }

}
