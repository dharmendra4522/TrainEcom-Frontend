import { Component, Input, ViewChild, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class SidePanelComponent implements OnInit {
  private router = inject(Router);
  private store = inject(Store);
  private wishListService = inject(WishListService);
  private cdr = inject(ChangeDetectorRef);

  @Input() type: 'WishList' | 'Cart' | 'Notification' = 'WishList';
  @Input() items: WishListItem[] = [];

  @ViewChild('drawer') drawer!: MatDrawer;

  ngOnInit(): void {
    if (this.type === 'WishList') {
      this.wishListService.wishlistItems$.subscribe({
        next: (items: WishListItem[]) => {
          this.items = items || [];
          this.cdr.detectChanges();
        }
      });
      this.wishListService.loadWishlist();
    }
  }

  open(): void {
    this.drawer.open();
    if (this.type === 'WishList') {
      this.loadWishlistItems();
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
    return this.items.reduce((sum: number, item: WishListItem) => sum + (item.price * (item.quantity || 1)), 0);
  }

  loadWishlistItems(): void {
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.items = [];
        this.cdr.detectChanges();
        return;
      }

      this.wishListService.getWishList().subscribe({
        next: (items: WishListItem[]) => {
          this.items = items || [];
          this.cdr.detectChanges();
        }
      });
    });
  }

  navigateToShopping(): void {
    this.close();
    this.router.navigate(['/']);
  }

  handleRemove(productId: string): void {
    if (this.type === 'Cart') {
      console.log('Dispatching remove from cart:', productId);
    } else if (this.type === 'WishList') {
      this.wishListService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.items = this.items.filter((i: WishListItem) => i.productId !== productId && i.id !== productId);
          ProductCardComponent.wishlistCache.delete(productId);
        },
        error: (err: unknown) => {
          console.error('Failed to remove from wishlist:', err);
        }
      });
    }
  }

  handleQuantity(event: { id: string | number; action: 'add' | 'subtract' }): void {
    console.log('Dispatching quantity update:', event);
  }

  handleMoveToCart(item: any): void {
    if (this.type === 'WishList') {
      const productId = item.productId || item.id;
      if (!productId) return;

      const cart: Array<{ id: string; name: string; price: number; image: string; quantity: number }> =
        JSON.parse(localStorage.getItem('cart') || '[]');

      const existingProduct = cart.find((i) => i.id === productId);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({
          id: productId,
          name: item.productName || item.name || '',
          price: item.price || 0,
          image: item.thumbnailUrl || item.image || '',
          quantity: 1
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));

      this.wishListService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.items = this.items.filter((i: WishListItem) => i.productId !== productId && i.id !== productId);
          ProductCardComponent.wishlistCache.delete(productId);
        },
        error: (err: unknown) => {
          console.error('Failed to move to cart:', err);
        }
      });
    }
  }
}