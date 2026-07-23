import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CartItem } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  private router = inject(Router);
  private notification = inject(NotificationService);
  private cartService = inject(CartService);

  cartItems: CartItem[] = [];

  subtotal: number = 0;
  totalQuantity: number = 0;
  couponCode: string = '';

  ngOnInit(): void {
    this.loadCartItems();
    // this.calculateTotal();
  }

  private loadCartItems(): void {
    this.cartService.getCartItems().subscribe({
      next: (response) => {
        this.cartItems = response.items.map(item => ({
          ...item,
          name: item.productName,
          price: item.unitPrice !== undefined ? item.unitPrice : (item as any).price,
          id: item.productId,
          quantity: item.quantity || 1
        }));
        this.subtotal = response.totalAmount;
        this.totalQuantity = response.totalQuantity;
      },
      error: (err) => {
        console.error('Failed to load cart items:', err);
        this.notification.showError('Could not load cart items', 'Close');
      }
    });
  }

  onQuantityInputChange(productId: string | number, event: any): void {
    const newQty = parseInt(event.target.value, 10);
    const item = this.cartItems.find(i => i.productId === productId || i.itemId === productId);

    if (item && !isNaN(newQty)) {
      if (newQty <= 0) {
        this.removeItem(productId);
      } else {
        const targetId = item.itemId ? item.itemId.toString() : productId.toString();

        this.cartService.updateCartItem(targetId, newQty).subscribe({
          next: (response) => {
            item.quantity = newQty;
            if (response && response.totalAmount !== undefined) {
              this.subtotal = response.totalAmount;
            } else {
              this.loadCartItems();
            }
            this.notification.showSuccess('Cart updated successfully.', 'Close');
          },
          error: (err) => {
            console.error('Failed to update quantity:', err);
            this.notification.showError('Could not update quantity', 'Close');
            event.target.value = item.quantity;
          }
        });
      }
    }
  }

  updateQuantity(productId: string | number, action: 'add' | 'subtract'): void {
    const item = this.cartItems.find(i => i.productId === productId || i.itemId === productId);
    if (!item) return;

    const currentQty = item.quantity || 1;
    const newQty = action === 'add' ? currentQty + 1 : currentQty - 1;

    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }

    const targetId = item.itemId ? item.itemId.toString() : productId.toString();

    this.cartService.updateCartItem(targetId, newQty).subscribe({
      next: (response) => {
        item.quantity = newQty;
      },
      error: (err) => {
        console.error('Failed to update cart item:', err);
        this.notification.showError('Could not update cart item', 'Close');
      }
    });
    this.loadCartItems();
  }

  removeItem(productId: string | number): void {
    const item = this.cartItems.find(i => i.productId === productId || i.itemId === productId);
    if (!item) return;

    const targetId = item.itemId ? item.itemId.toString() : productId.toString();

    this.cartService.deleteCartItem(targetId).subscribe({
      next: (response) => {
        this.cartItems = this.cartItems.filter(i => i.productId !== productId && i.itemId !== productId);

        if (response && response.totalAmount !== undefined) {
          this.subtotal = response.totalAmount;
        }

        this.notification.showSuccess('Item removed from cart.', 'Close');
      },
      error: (err) => {
        console.error('Failed to remove item from cart:', err);
        this.notification.showError('Could not remove item from cart', 'Close');
      }
    });
      this.loadCartItems();
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