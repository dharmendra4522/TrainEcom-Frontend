import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { WishListItem } from '../../../core/models/wishList.model';
import { WishListService } from '../../../core/services/wish-list.service';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';
import { take } from 'rxjs/operators';


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
      console.log('Dispatching remove from wishlist:', id);
    }
  }

  handleQuantity(event: { id: string | number, action: 'add' | 'subtract' }): void {
    console.log('Dispatching quantity update:', event);
  }

  handleMoveToCart(item: WishListItem): void {
    console.log('Moving item from wishlist to cart:', item);
  }
}