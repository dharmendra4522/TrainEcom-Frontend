import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CartItem, CartResponse } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  private router = inject(Router);
  private notification = inject(NotificationService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);

  cartItems: CartItem[] = [];
  subtotal: number = 0;
  totalQuantity: number = 0;
  couponCode: string = '';

  ngOnInit(): void {
    this.loadCartItems();
  }

  // Server se cart items aur totals load karna
  private loadCartItems(): void {
    this.cartService.getCartItems().subscribe({
      next: (response: CartResponse) => {
        this.cartItems = (response.items || []).map((item: CartItem) => ({
          ...item,
          name: item.productName,
          price: item.unitPrice !== undefined ? item.unitPrice : (item as unknown as { price: number }).price,
          id: item.productId,
          quantity: item.quantity || 1
        }));
        this.subtotal = response.totalAmount;
        this.totalQuantity = response.totalQuantity;
      },
      error: (err: unknown) => {
        console.error('Failed to load cart items:', err);
        this.notification.showError('Could not load cart items', 'Close');
      }
    });
  }

  // Plus / Minus button quantity update handler
  updateQuantity(productId: string | number, action: 'add' | 'subtract'): void {
    const item = this.findCartItem(productId);
    if (!item) return;

    const currentQty = item.quantity || 1;
    const newQty = action === 'add' ? currentQty + 1 : currentQty - 1;

    if (newQty <= 0) {
      this.confirmAndDeleteItem(productId);
      return;
    }

    if (action === 'add') {
      this.verifyStockAndExecuteUpdate(item, newQty);
    } else {
      this.executeCartUpdate(item, newQty);
    }
  }

  // Item find karne ke liye helper method
  private findCartItem(productId: string | number): CartItem | undefined {
    return this.cartItems.find(i => i.productId === productId || i.itemId === productId);
  }

  // Quantity 0 hone par deletion confirmation
  private confirmAndDeleteItem(productId: string | number): void {
    const confirmDelete = window.confirm('Setting the quantity to 0 will delete this item from your cart. Do you want to proceed?');
    if (confirmDelete) {
      this.removeItem(productId);
    }
  }

  // Stock check karke backend update execute karna
  private verifyStockAndExecuteUpdate(item: CartItem, newQty: number): void {
    this.productService.getProductById(item.productId.toString()).subscribe({
      next: (product: Product) => {
        const stock = product.stockQuantity;
        if (stock !== undefined && newQty > stock) {
          this.notification.showError(`Only ${stock} items are available in stock.`, 'Close');
          return;
        }
        this.executeCartUpdate(item, newQty);
      },
      error: (err: unknown) => {
        console.error('Failed to verify stock, proceeding with update:', err);
        this.executeCartUpdate(item, newQty);
      }
    });
  }

  // Backend API call to update quantity and refresh totals from server response
  private executeCartUpdate(item: CartItem, newQty: number): void {
    const targetId = item.itemId ? item.itemId.toString() : item.productId.toString();

    this.cartService.updateCartItem(targetId, newQty).subscribe({
      next: (response: CartResponse) => {
        // Server se updated totals aur items directly assign kar rahe hain
        if (response && response.items) {
          this.cartItems = response.items.map((i: CartItem) => ({
            ...i,
            name: i.productName,
            price: i.unitPrice,
            id: i.productId,
            quantity: i.quantity
          }));
          this.subtotal = response.totalAmount;
          this.totalQuantity = response.totalQuantity;
        } else {
          this.loadCartItems();
        }
        this.notification.showSuccess('Cart updated successfully.', 'Close');
      },
      error: (err: unknown) => {
        console.error('Failed to update cart item:', err);
        this.notification.showError('Could not update cart item', 'Close');
      }
    });
  }

  removeItem(productId: string | number): void {
    const item = this.findCartItem(productId);
    if (!item) return;
    const confirmDelete = window.confirm(`Are you sure you want to remove "${item.productName || 'this item'}" from your cart?`);
    if (!confirmDelete) {
      return;
    }

    const targetId = item.itemId ? item.itemId.toString() : productId.toString();

    this.cartService.deleteCartItem(targetId).subscribe({
      next: (response: CartResponse) => {
        if (response && response.items) {
          this.cartItems = response.items.map((i: CartItem) => ({
            ...i,
            name: i.productName,
            price: i.unitPrice,
            id: i.productId,
            quantity: i.quantity
          }));
          this.subtotal = response.totalAmount;
          this.totalQuantity = response.totalQuantity;
        } else {
          this.loadCartItems();
        }
        this.notification.showSuccess('Item removed from cart.', 'Close');
      },
      error: (err: unknown) => {
        console.error('Failed to remove item from cart:', err);
        this.notification.showError('Could not remove item from cart', 'Close');
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.notification.showInfo('Your cart is empty. Add items to proceed to checkout.', 'Close');
      return;
    }
    this.notification.showSuccess('Proceeding to checkout.', 'Close');
    this.router.navigate(['/checkout']);
  }
}