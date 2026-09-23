import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { CartItem, CartProductDetails, CartResponse } from '../models/cart.model';
import { NotificationService } from './notification.service';
import { Store } from '@ngrx/store';
import { of, take, tap } from 'rxjs';
import { selectIsLoggedIn } from '../store/auth/auth.selectors';
import * as CartActions from '../store/cart/cart.actions';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseAPI = `${environment.apiBaseUrl}/cart`;

  private http = inject(HttpClient);
  private store = inject(Store);

  private isUserLoggedIn(): boolean {
    let isLoggedIn = false;
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe((status: boolean) => {
      isLoggedIn = status;
    });
    return isLoggedIn;
  }

  // extract items from session storage for guest users
  private getLocalCartItems(): CartItem[] {
    try {
      const cart = sessionStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  }

  private saveLocalCartItems(items: CartItem[]): void {
    sessionStorage.setItem('cart', JSON.stringify(items));
  }

  private buildLocalCartResponse(items: CartItem[]): CartResponse {
    const totalQuantity = items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
    const totalAmount = items.reduce(
      (sum: number, i: CartItem) => sum + (i.unitPrice || 0) * i.quantity,
      0,
    );
    return { items, totalQuantity, totalAmount };
  }

  getCartItems(): Observable<CartResponse> {
    if (!this.isUserLoggedIn()) {
      return of(this.buildLocalCartResponse(this.getLocalCartItems()));
    }

    return this.http.get<CartResponse>(`${this.baseAPI}/cartItems`);
  }

  loadCart(): void {
    if (!this.isUserLoggedIn()) {
      this.store.dispatch(CartActions.loadCart());
      return;
    }

    const localCartStr = sessionStorage.getItem('cart');
    if (!localCartStr) {
      this.store.dispatch(CartActions.loadCart());
      return;
    }

    try {
      const localItems: CartItem[] = JSON.parse(localCartStr);
      if (Array.isArray(localItems) && localItems.length > 0) {
        sessionStorage.removeItem('cart');

        const mergePayload = localItems.map((i: CartItem) => ({
          productId: i.productId,
          quantity: i.quantity,
        }));
        this.store.dispatch(CartActions.mergeCart({ cartItems: mergePayload as CartItem[] }));
        return;
      }
    } catch (e: unknown) {
      console.error('Failed to parse local cart:', e);
    }

    this.store.dispatch(CartActions.loadCart());
  }

  addToCart(productId: string | number, quantity: number, productDetails?: CartProductDetails): Observable<CartResponse> {
    const normalizedProductId = String(productId);
    if (!this.isUserLoggedIn()) {
      const items = this.getLocalCartItems();
      const existing = items.find((i: CartItem) => i.productId.toString() === normalizedProductId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        const newItem: CartItem = {
          productId: normalizedProductId,
          productName: productDetails?.productName || 'Unknown Product',
          unitPrice: productDetails?.unitPrice || 0,
          quantity: quantity,
          thumbnailUrl: productDetails?.thumbnailUrl || productDetails?.image || '',
        }
        items.push(newItem);
      }
      this.saveLocalCartItems(items);
      return of(this.buildLocalCartResponse(items));
    }
    return this.http
      .post<CartResponse>(`${this.baseAPI}/addItem`, { productId: normalizedProductId, quantity });
  }

  updateCartItem(itemId: string | number, quantity: number): Observable<CartResponse> {
    const normalizedItemId = String(itemId);
    if (!this.isUserLoggedIn()) {
      const items = this.getLocalCartItems();
      const existing = items.find(
        (i: CartItem) =>
          (i.itemId || i.productId)?.toString() === normalizedItemId,
      );
      if (existing) {
        existing.quantity = quantity;
        this.saveLocalCartItems(items);
      }
      return of(this.buildLocalCartResponse(items));
    }
    return this.http
      .put<CartResponse>(`${this.baseAPI}/updateItem/${normalizedItemId}`, { quantity });
  }

  deleteCartItem(itemId: string | number): Observable<CartResponse> {
    const normalizedItemId = String(itemId);
    if (!this.isUserLoggedIn()) {
      let items = this.getLocalCartItems();
      items = items.filter((i: CartItem) => i.productId.toString() !== normalizedItemId);
      this.saveLocalCartItems(items);
      return of(this.buildLocalCartResponse(items));
    }

    return this.http
      .delete<CartResponse>(`${this.baseAPI}/deleteItem/${normalizedItemId}`);
  }

  mergeCart(cartItems: CartItem[]): Observable<CartResponse> {
    return this.http
      .post<CartResponse>(`${this.baseAPI}/merge`, { items: cartItems });
  }

  clearCart(): Observable<CartResponse> {
    if (!this.isUserLoggedIn()) {
      this.saveLocalCartItems([]);
      return of(this.buildLocalCartResponse([]));
    }

    return this.http
      .delete<CartResponse>(`${this.baseAPI}/clear`);
  }
}
