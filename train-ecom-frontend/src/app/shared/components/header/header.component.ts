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
import {
  Subject,
  takeUntil,
  combineLatest,
  Subscription,
  interval,
  takeWhile,
  map,
} from 'rxjs';
import { selectCartTotalQuantity } from '../../../core/store/cart/cart.selectors';
import { Router } from '@angular/router';
import { Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private router = inject(Router);
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

  // session timer
  formattedTime: string = '05:00';
  private timerSubscribe?: Subscription;
  private TIMER_DURATION: number = 5 * 60 * 1000;

  ngOnInit() {
    this.initAuthSubscription();
    this.checkAndStartVendorTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if ((this, this.timerSubscribe)) {
      this.timerSubscribe.unsubscribe();
    }
  }

  get isPendingStatus(): boolean {
    const status: string | null = localStorage.getItem('vendorStatus');
    return status === 'Pending';
  }

  private checkAndStartVendorTimer(): void {
    combineLatest([this.userRole$, this.isLoggedIn$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([role, isLoggedIn]) => {
        if (isLoggedIn && role === Role.Vendor && this.isPendingStatus) {
          this.startCount();
        }
      });
  }

  private startCount(): void {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const payloadBase64 = accessToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      const targetTime: number = decodedPayload.exp * 1000;

      this.timerSubscribe = interval(1000)
        .pipe(
          map(() => {
            const now: number = new Date().getTime();
            const remainitMg: number = targetTime - now;
            return Math.max(0, Math.floor(remainitMg / 1000));
          }),
          takeWhile((timeLeft: number) => timeLeft >= 0),
        )
        .subscribe({
          next: (timeLeft: number) => {
            this.formattedTime = this.formateTime(timeLeft);
            if (timeLeft === 0) {
              this.onLogout();
            }
          },
        });
    } catch (error) {
      console.error('Failed to parse token expiration', error);
    }
  }

  private formateTime(totalSecond: number): string {
    const min: number = Math.floor(totalSecond / 60);
    const sec: number = totalSecond % 60;
    const padMin: string = min < 10 ? `0${min}` : `${min}`;
    const padSec: string = sec < 10 ? `0${sec}` : `${sec}`;
    return `${padMin}:${padSec}`;
  }

  private initAuthSubscription(): void {
    combineLatest([this.isLoggedIn$, this.userRole$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isLoggedIn, role]) => {
        if (isLoggedIn) {
          if ((role && role === 'Admin') || role === 'Vendor') {
            return;
          }
          this.store.dispatch(WishlistActions.loadWishlist());
        } else {
          // The cart feature owns hydration/reset for session changes.
          // The badge remains selector-driven and updates from cart state.
        }
      });
  }

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
  onOpenWishlistClick(): void {
    this.openWishlist.emit();
  }
  onOpenCartClick(): void {
    this.openCart.emit();
  }

  onOpenNotificationClick(): void {
    this.openNotification.emit();
  }
}
