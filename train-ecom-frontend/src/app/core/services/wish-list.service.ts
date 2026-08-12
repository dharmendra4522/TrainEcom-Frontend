import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { WishListItem, WishlistApiResponse, WishlistActionResponse } from '../models/wishList.model';

@Injectable({
  providedIn: 'root'
})
export class WishListService {

  private baseAPI = `${environment.apiBaseUrl}/wishlist`;
  private http = inject(HttpClient);

  getWishList(): Observable<WishListItem[]> {
    return this.http.get<WishlistApiResponse>(`${this.baseAPI}/wishlist-items`).pipe(
      map((res: WishlistApiResponse) => {
        const rawItems = res.result?.items;
        
        const itemArray: WishListItem[] = Array.isArray(rawItems) 
          ? rawItems 
          : (rawItems ? [rawItems] : []);

        return itemArray.map((item: WishListItem) => ({
          ...item,
          id: item.productId,
          name: item.productName,
          image: item.thumbnailUrl,
          averageRating: item.averageRating ?? 0,
          reviewCount: item.reviewCount ?? 0,
        }));
      })
    );
  }

  addToWishlist(productId: string): Observable<WishlistActionResponse> {
    return this.http.post<WishlistActionResponse>(`${this.baseAPI}/add/products/${productId}`, {});
  }

  removeFromWishlist(productId: string): Observable<WishlistActionResponse> {
    return this.http.delete<WishlistActionResponse>(`${this.baseAPI}/delete/products/${productId}`);
  }

  checkInWishlist(productId: string): Observable<boolean> {
    return this.http.get<{ isWishlisted: boolean }>(`${this.baseAPI}/products/${productId}/status`).pipe(
      map(res => !!res?.isWishlisted)
    );
  }
}    