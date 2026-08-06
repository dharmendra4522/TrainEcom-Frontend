import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import {
  selectIsLoggedIn,
  selectUserRole,
} from '../../../core/store/auth/auth.selectors';
import { selectUserProfile } from '../../../core/store/user/user.selectors';
import * as WishlistActions from '../../../core/store/wish-list/wishList.actions';
import { selectWishlistCount } from '../../../core/store/wish-list/wishList.selectors';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { selectCartTotalQuantity } from '../../../core/store/cart/cart.selectors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private destroy$ = new Subject<void>();

  @Input() showMenuButton: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  @Output() openWishlist = new EventEmitter<void>();
  @Output() openCart = new EventEmitter<void>();
  @Output() openNotification = new EventEmitter<void>();

  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  userRole$ = this.store.select(selectUserRole);
  userProfile$ = this.store.select(selectUserProfile);

  wishlistCount$ = this.store.select(selectWishlistCount);
  cartCount$ = this.store.select(selectCartTotalQuantity);

  ngOnInit() {
    this.initAuthSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initAuthSubscription(): void {
    combineLatest([this.isLoggedIn$, this.userRole$]).pipe(takeUntil(this.destroy$))
      .subscribe(([isLoggedIn, role]) => {
        if (isLoggedIn) {
          if(role && role === 'Admin'){
            return;
          }
          this.store.dispatch(WishlistActions.loadWishlist());
        } else{
          // The cart feature owns hydration/reset for session changes.
          // The badge remains selector-driven and updates from cart state.
        }
      });
  }

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
