import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import {
  selectIsLoggedIn,
  selectUserRole,
} from '../../../core/store/auth/auth.selectors';
import { selectUserProfile } from '../../../core/store/user/user.selectors';
import { WishListService } from '../../../core/services/wish-list.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  private readonly store = inject(Store);
  private wishListService = inject(WishListService);
  private cartService = inject(CartService);

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
    this.initCartSubscription();
    this.initAuthSubscription();
  }

  private initWishlistSubscription(): void {
    this.wishListService.wishlistItems$.subscribe({
      next: (items) => {
        this.wishlistCount = items ? items.length : 0;
      }
    });
  }

  private initCartSubscription(): void {
    this.cartService.cartItems$.subscribe({
      next: (items) => {
        this.cartCount = items ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
      }
    });
  }

  private initAuthSubscription(): void {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.wishListService.loadWishlist();
        this.cartService.loadCart();
      } else {
        this.wishlistCount = 0;
        this.cartService.loadCart();
      }
    });
  }

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}