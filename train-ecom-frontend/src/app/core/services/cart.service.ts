import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { CartItem, CartResponse } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseAPI = `${environment.apiBaseUrl}/cart`;
  private http = inject(HttpClient);

  getCartItems(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.baseAPI}/cartItems`);
  }
  
  addToCart(productId: string, quantity: number): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.baseAPI}/addItem`, { productId, quantity });
  }

  updateCartItem(itemId: string, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.baseAPI}/updateItem/${itemId}`, { quantity });
  }

  deleteCartItem(itemId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.baseAPI}/deleteItem/${itemId}`);
  }

  mergeCart(cartItems: CartItem[]): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.baseAPI}/merge`, { items: cartItems });
  }

  clearCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.baseAPI}/clear`);
  }


}
