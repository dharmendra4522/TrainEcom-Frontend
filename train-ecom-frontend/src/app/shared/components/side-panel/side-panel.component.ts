import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { WishListItem } from '../../../core/models/wishList.model';
import { WishListService } from '../../../core/services/wish-list.service';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';
import { take } from 'rxjs/operators';
import { ProductCardComponent } from '../product-card/product-card.component';


@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent {
  private router = inject(Router);
  private store = inject(Store);
  private wishListService = inject(WishListService);

  @Input() type: 'WishList' | 'Cart' | 'Notification' = 'WishList';
  @Input() items: WishListItem[] = [];

  @ViewChild('drawer') drawer!: MatDrawer;

  open() {
    this.drawer.open();
    if (this.type === 'WishList') {
      this.loadWishlistItems();
    }
  }

  close() {
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
    return this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }

  loadWishlistItems(): void {
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.items = [];
        return;
      }

      this.wishListService.getWishList().subscribe({
        next: (items) => {
          this.items = items;
        }
      });
    });
  }

  navigateToShopping(): void {
    this.close();
    this.router.navigate(['/']);
  }

  handleRemove(id: string | number): void {
    if (this.type === 'Cart') {
      console.log('Dispatching remove from cart:', id);
    } else if (this.type === 'WishList') {
      const item = this.items.find(i => i.id === id);
      const productId = item?.productId || id.toString();

      this.wishListService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.items = this.items.filter(i => i.id !== id);
          ProductCardComponent.wishlistCache.delete(productId);
        },
        error: (err) => {
          console.error('Failed to remove from wishlist:', err);
        }
      });
    }
  }

  handleQuantity(event: { id: string | number, action: 'add' | 'subtract' }): void {
    console.log('Dispatching quantity update:', event);
  }

  handleMoveToCart(item: WishListItem): void {
    if (this.type === 'WishList') {
      const productId = item.productId || item.id;
      
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingProduct = cart.find((i: any) => i.id === productId);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({
          id: productId,
          name: item.name,
          price: item.price,
          image: item.image || item.thumbnailUrl,
          quantity: 1
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      
      this.wishListService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.items = this.items.filter(i => i.id !== item.id);
          ProductCardComponent.wishlistCache.delete(productId);
        },
        error: (err) => {
          console.error('Failed to move to cart:', err);
        }
      });
    }
  }
}