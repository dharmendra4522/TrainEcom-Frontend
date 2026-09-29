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
  startWith,
} from 'rxjs';
import { selectCartTotalQuantity } from '../../../core/store/cart/cart.selectors';
import { Router } from '@angular/router';
import { Role } from '../../../core/models/auth.model';
import { ApprovalStatus } from '../../../core/models/user.model';
import { normalizeApprovalStatus, normalizeRole } from '../../../core/utils/role.utils';

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

  isAdminRole$ = this.userRole$.pipe(
    map((role) => normalizeRole(role as string | number | null | undefined) === Role.Admin),
  );
  isVendorRole$ = this.userRole$.pipe(
    map((role) => normalizeRole(role as string | number | null | undefined) === Role.Vendor),
  );
  isCustomerRole$ = this.userRole$.pipe(
    map((role) => normalizeRole(role as string | number | null | undefined) === Role.Customer),
  );
  //  True for admin or vendor — hides customer-specific controls 
  isManagementRole$ = combineLatest([this.isAdminRole$, this.isVendorRole$]).pipe(
    map(([isAdmin, isVendor]) => isAdmin || isVendor),
  );

  formattedTime: string = '00:00';
  private timerSubscribe?: Subscription;

  ngOnInit() {
    this.initAuthSubscription();
    this.checkAndStartVendorTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerSubscribe) {
      this.timerSubscribe.unsubscribe();
    }
  }

  get isPendingStatus(): boolean {
    const status = localStorage.getItem('vendorStatus');
    const normalized = normalizeApprovalStatus(status);
    return normalized === ApprovalStatus.Pending;
  }

  private checkAndStartVendorTimer(): void {
    combineLatest([this.userRole$, this.isLoggedIn$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([role, isLoggedIn]) => {
        const normalizedRole = normalizeRole(role);
        if (isLoggedIn && normalizedRole === Role.Vendor && this.isPendingStatus) {
          this.startCount();
        }
      });
  }

  private startCount(): void {
    this.timerSubscribe?.unsubscribe();
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const payloadBase64 = accessToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      const targetTime: number = decodedPayload.exp * 1000;

      this.timerSubscribe = interval(1000)
        .pipe(
          startWith(0),
          map(() => Math.max(0, Math.ceil((targetTime - Date.now()) / 1000))),
          takeWhile((timeLeft: number) => timeLeft > 0, true),
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
          const normalizedRole = normalizeRole(role);
          if (normalizedRole === Role.Admin || normalizedRole === Role.Vendor) {
            return;
          }
          this.store.dispatch(WishlistActions.loadWishlist());
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

