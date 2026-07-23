import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, shareReplay } from 'rxjs/operators';
import { WishListItem, WishlistApiResponse, WishlistActionResponse } from '../models/wishList.model';

@Injectable({
  providedIn: 'root'
})
export class WishListService {

  private baseAPI = `${environment.apiBaseUrl}/wishlist`;
  private http = inject(HttpClient);

  private wishlistItemsSubject = new BehaviorSubject<WishListItem[]>([]);
  wishlistItems$ = this.wishlistItemsSubject.asObservable();

  private isLoaded = false;
  private loadRequest$: Observable<WishListItem[]> | null = null;

  getWishList(): Observable<WishListItem[]> {
    if (this.loadRequest$) {
      return this.loadRequest$;
    }

    this.loadRequest$ = this.http.get<WishlistApiResponse>(`${this.baseAPI}/wishlist-items`).pipe(
      map((res: WishlistApiResponse) => {
        const rawItems = res.result?.items;
        
        const itemArray: WishListItem[] = Array.isArray(rawItems) 
          ? rawItems 
          : (rawItems ? [rawItems] : []);

        return itemArray.map((item: WishListItem) => ({
          ...item,
          id: item.productId,
          name: item.productName,
          image: item.thumbnailUrl
        }));
      }),
      tap((items) => {
        this.wishlistItemsSubject.next(items || []);
        this.isLoaded = true;
        this.loadRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.loadRequest$;
  }

  loadWishlist(): void {
    if (!this.isLoaded) {
      this.getWishList().subscribe();
    }
  }

  addToWishlist(productId: string): Observable<WishlistActionResponse> {
    return this.http.post<WishlistActionResponse>(`${this.baseAPI}/add/products/${productId}`, {}).pipe(
      tap(() => this.getWishList().subscribe())
    );
  }

  removeFromWishlist(productId: string): Observable<WishlistActionResponse> {
    return this.http.delete<WishlistActionResponse>(`${this.baseAPI}/delete/products/${productId}`).pipe(
      tap(() => this.getWishList().subscribe())
    );
  }

  checkInWishlist(productId: string): Observable<boolean> {
    return this.http.get<{ isWishlisted: boolean }>(`${this.baseAPI}/products/${productId}/status`).pipe(
      map(res => !!res?.isWishlisted)
    );
  }
}    