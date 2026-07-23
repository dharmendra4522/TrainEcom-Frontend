import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import {
  selectIsLoggedIn,
  selectUserRole,
} from '../../../core/store/auth/auth.selectors';
import { selectUserProfile } from '../../../core/store/user/user.selectors';
import { WishListService } from '../../../core/services/wish-list.service';

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
    this.initWishlistSubscription();
    this.initAuthSubscription();
    this.loadCartCount();
  }

  
  private initWishlistSubscription(): void {
    this.wishListService.wishlistItems$.subscribe({
      next: (items) => {
        this.wishlistCount = items ? items.length : 0;
      }
    });
  }

// load wishlist count on login
  private initAuthSubscription(): void {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.wishListService.loadWishlist();
      } else {
        this.wishlistCount = 0;
      }
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