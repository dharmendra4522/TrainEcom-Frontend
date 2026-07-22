import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import {
  selectIsLoggedIn,
  selectUserRole,
} from '../../../core/store/auth/auth.selectors';
import { selectUserProfile } from '../../../core/store/user/user.selectors';
import { WishListService } from '../../../core/services/wish-list.service';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private readonly store = inject(Store);
  private wishListService = inject(WishListService);

  @Input() showMenuButton: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  @Output() openWishlist = new EventEmitter<void>();
  @Output() openCart = new EventEmitter<void>();

  @Output() openNotification = new EventEmitter<void>();

  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  userRole$ = this.store.select(selectUserRole);
  userProfile$ = this.store.select(selectUserProfile);

  wishlistCount: number = 0;
  cartCount: number = 0;

  ngOnInit() {
    this.loadWishlistCount();
    this.loadCartCount();
  }

  loadWishlistCount() {
    this.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.wishlistCount = 0;
        return;
      }

      this.wishListService.getWishList().subscribe({
        next: (items) => {
          this.wishlistCount = items ? items.length : 0;
        },
        error: (err) => {
          console.error('Failed to load wishlist count for header:', err);
          this.wishlistCount = 0;
        }
      });
    });
  }

  loadCartCount() {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      this.cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
    } catch {
      this.cartCount = 0;
    }
  }
  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
