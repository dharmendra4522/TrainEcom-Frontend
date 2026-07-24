import { ProductService } from './../../../core/services/product.service';
import { Component, Input, ViewChild, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { WishListItem } from '../../../core/models/wishList.model';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';
import { take } from 'rxjs/operators';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CartItem } from '../../../core/models/cart.model';
import * as WishlistActions from '../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../core/store/wish-list/wishList.selectors';


export interface SidePanelItem {
  id: string;
  productId: string;
  productName?: string;
  name: string;
  unitPrice?: number;
  price: number;
  thumbnailUrl?: string;
  image?: string;
  quantity?: number;
}
@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent implements OnInit {
  private router = inject(Router);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private productService = inject(ProductService);

  @Input() type: 'WishList' | 'Cart' | 'Notification' = 'WishList';
  @Input() items: SidePanelItem[] = [];

  @ViewChild('drawer') drawer!: MatDrawer;

  ngOnInit(): void {
    this.initializePanelData();
  }

  private initializePanelData(): void {
    if (this.type === 'WishList') {
      this.subscribeToWishlistStream();
      this.watchAuthStatusForWishlist();
    } else if (this.type === 'Cart') {
      this.subscribeToCartStream();
      this.watchAuthStatusForCart();
    }
  }

  private subscribeToWishlistStream(): void {
    this.store.select(selectWishlistItems).subscribe({
      next: (items: WishListItem[]) => {
        this.items = (items || []).map((item: any) => ({
          ...item,
          id: item.productId || item.id,
          name: item.productName || item.name || '', // <-- name ko string ensure kiya
          price: item.price || 0
        }));
        this.cdr.detectChanges();
      }
    });
  }

  private watchAuthStatusForWishlist(): void {
    this.store.select(selectIsLoggedIn).subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.store.dispatch(WishlistActions.loadWishlist());
      } else {
        this.items = [];
        this.cdr.detectChanges();
      }
    })
  }

  private subscribeToCartStream(): void {
    this.cartService.cartItems$.subscribe({
      next: (items: CartItem[]) => {
        this.items = (items || []).map((item: CartItem) => ({
          ...item,
          id: item.itemId || item.productId.toString(),
          name: item.productName,
          price: item.unitPrice,
          image: item.thumbnailUrl
        }));
        this.cdr.detectChanges();
      }
    });
  }

  private watchAuthStatusForCart(): void {
    this.store.select(selectIsLoggedIn).subscribe(() => {
      this.cartService.loadCart();
    });
  }

  open(): void {
    this.drawer.open();
    if (this.type === 'WishList') {
      this.loadWishlistItems();
    } else if (this.type === 'Cart') {
      this.cartService.getCartItems().subscribe();
    }
  }

  close(): void {
    this.drawer.close();
  }

  get title(): string {
    switch (this.type) {
      case 'WishList':
        return 'My Wishlist';
      case 'Cart':
        return 'Shopping Cart';
      case 'Notification':
        return 'Notifications';
      default:
        return '';
    }
  }

  get icon(): string {
    if (this.type === 'WishList') return 'favorite';
    if (this.type === 'Cart') return 'shopping_cart';
    return 'notifications';
  }

  get getTotalPrice(): number {
    return this.items.reduce((sum: number, item: any) => {
      const price = item.price || item.unitPrice || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }

  get totalQuantity(): number {
    return this.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  }

  loadWishlistItems(): void {
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.items = [];
        this.cdr.detectChanges();
        return;
      }
      this.store.dispatch(WishlistActions.loadWishlist());
    });
  }

  navigateToShopping(): void {
    this.close();
    this.router.navigate(['/']);
  }

  navigateToCheckout(): void {
    this.close();
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.router.navigate(['/checkout']);
      } else {
        this.notificationService.showInfo('Please log in to proceed to checkout.', 'Close');
        this.router.navigate(['/login']);
      }
    });
  }

  handleRemove(itemId: string): void {
    if (this.type === 'Cart') {
      this.removeCartItem(itemId);
    } else if (this.type === 'WishList') {
      this.removeWishlistItem(itemId);
    }
  }

  private removeCartItem(itemId: string): void {
    this.cartService.deleteCartItem(itemId).subscribe({
      error: (err: unknown) => console.error('Failed to remove cart item:', err)
    })
  }

  private removeWishlistItem(productId: string): void {
    this.store.dispatch(WishlistActions.removeFromWishlist({ productId }));
  }

  handleQuantity(event: { id: string | number; action: 'add' | 'subtract' }): void {
    if (this.type !== 'Cart') return;
    const item: any = this.items.find((i: any) => i.id === event.id || i.productId === event.id);
    if (!item) return;

    const currQty = item.quantity || 1;
    const newQty = event.action === 'add' ? currQty + 1 : currQty - 1;

    if (newQty <= 0) {
      this.confirmAndRemoveItem(item.id);
      return;
    }
    if (event.action === 'add') {
      this.verifyStockAndUpdateQuantity(item, newQty);
    } else {
      this.updateCartItemQuantity(item.id, newQty);
    }
  }

  private confirmAndRemoveItem(itemId: string): void {
    const confirmDelete = window.confirm('Setting the quantity to 0 will delete this item from your cart. Do you want to proceed?');
    if (confirmDelete) {
      this.handleRemove(itemId);
    }
  }

  private verifyStockAndUpdateQuantity(item: any, newQty: number): void {
    const productId = item.productId || item.id;
    this.productService.getProductById(productId.toString()).subscribe({
      next: (product) => {
        const stock = product.stockQuantity;
        if (stock !== undefined && newQty > stock) {
          this.notificationService.showError(`Only ${stock} items are available in stock.`, 'Close');
          return;
        }
        this.updateCartItemQuantity(item.id, newQty);
      },
      error: (err: unknown) => {
        console.error('Failed to verify stock:', err);
        this.updateCartItemQuantity(item.id, newQty); // Fallback update
      }
    });
  }

  private updateCartItemQuantity(itemId: string, newQty: number): void {
    this.cartService.updateCartItem(itemId, newQty).subscribe({
      error: (err: unknown) => console.error('Failed to update quantity:', err)
    });
  }

  // Wishlist item ko Cart mein move karna
  handleMoveToCart(item: any): void {
    if (this.type !== 'WishList') return;

    const productId = item.productId || item.id;
    if (!productId) return;

    const productDetails: Record<string, unknown> = {
      productName: item.productName || item.name,
      unitPrice: item.unitPrice || item.price,
      thumbnailUrl: item.thumbnailUrl || item.image,
    };

    this.cartService.addToCart(productId.toString(), 1, productDetails).subscribe({
      next: () => {
        this.removeWishlistItem(productId);
      },
      error: (err: unknown) => {
        console.error('Failed to add to cart:', err);
      }
    });
  }
}