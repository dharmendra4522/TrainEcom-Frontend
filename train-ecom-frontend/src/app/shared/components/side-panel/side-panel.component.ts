import {
  Component,
  Input,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { WishListItem } from '../../../core/models/wishList.model';
import {
  selectIsLoggedIn,
  selectUserRole,
} from '../../../core/store/auth/auth.selectors';
import { take, takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../core/services/notification.service';
import { CartItem, CartProductDetails } from '../../../core/models/cart.model';
import * as WishlistActions from '../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../core/store/wish-list/wishList.selectors';
import { Actions, ofType } from '@ngrx/effects';
import * as CartActions from '../../../core/store/cart/cart.actions';
import { selectCartItems } from '../../../core/store/cart/cart.selectors';
import * as ProductActions from '../../../core/store/product/product.action';
import { Subject, combineLatest } from 'rxjs';
import { ConfirmDialogServiceService } from '../../../core/services/confirm-dialog.service';
import { NotificationStreamService } from '../../../core/services/notification-stream.service';
import { Role } from '../../../core/models/auth.model';
import { normalizeRole } from '../../../core/utils/role.utils';

export interface SidePanelItem {
  id: number;
  productId?: number;
  productName?: string;
  name: string;
  unitPrice?: number;
  price: number;
  thumbnailUrl?: string;
  image?: string;
  quantity?: number;
  totalproducts?: number;
  // For notifications
  title?: string;
  message?: string;
  timestamp?: string;
  isRead?: boolean;
  referenceId?: string | number;
  referenceType?: string;
}
@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private notificationService = inject(NotificationService);
  private actions$ = inject(Actions);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private notificationStream = inject(NotificationStreamService);

  private destroy$ = new Subject<void>();

  @Input() type: 'WishList' | 'Cart' | 'Notification' = 'WishList';
  @Input() items: SidePanelItem[] = [];

  @ViewChild('drawer') drawer!: MatDrawer;

  ngOnInit(): void {
    this.initializePanelData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializePanelData(): void {
    if (this.type === 'WishList') {
      this.subscribeToWishlistStream();
      this.watchAuthStatusForWishlist();
    } else if (this.type === 'Cart') {
      this.subscribeToCartStream();
      this.watchAuthStatusForCart();
    } else if (this.type === 'Notification') {
      this.loadNotifications();
    }
  }

  private loadNotifications(): void {
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.items = [];
        this.cdr.detectChanges();
        return;
      }

      this.notificationStream.getAllNotifications(1, 20)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.items = (response.items || [])
              .filter(n => !n.isHidden)
              .map(n => ({
                id: n.id,
                title: n.title,
                name: n.title,
                message: n.message,
                timestamp: n.createdAt,
                isRead: n.isRead,
                referenceId: n.referenceId || undefined,
                referenceType: n.referenceType || undefined,
                price: 0
              }));
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Failed to load side-panel notifications', err)
        });
    });
  }

  handleNotificationClick(item: SidePanelItem): void {
    if (this.type !== 'Notification') return;

    if (!item.isRead) {
      this.notificationStream.markAsRead(item.id).subscribe({
        next: () => {
          item.isRead = true;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to mark notification as read', err)
      });
    }

    if (item.referenceType && item.referenceId) {
      this.store.select(selectUserRole).pipe(take(1)).subscribe(role => {
        this.close();
        const type = item.referenceType as string;
        const id = item.referenceId;
        const normalizedRole = normalizeRole(role as string | number | null | undefined);

        const customerRoutes: Record<string, string> = {
          'Order': '/account/orders/customer-details',
          'Product': '/products',
        };

        const adminRoutes: Record<string, string> = {
          'Order': '/admin/orders/details',
          'Product': '/products',
          'User': '/admin/users/manage',
          'Vendor': '/admin/users/manage',
          'Vendor Request': '/admin/users/manage'
        };

        const routeMap = normalizedRole === Role.Admin ? adminRoutes : customerRoutes;
        const basePath = routeMap[type];

        if (basePath) {
          this.router.navigate([basePath, id]);
        } else {
          console.warn(`No route mapping found for referenceType: ${type}`);
        }
      });
    }
  }

  private subscribeToWishlistStream(): void {
    this.store
      .select(selectWishlistItems)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: WishListItem[]) => {
          this.items = (items || []).map((item: WishListItem) => ({
            ...item,
            id: item.productId || item.id,
            name: item.productName || item.name || '',
            price: item.price || 0,
          }));
          this.cdr.detectChanges();
        },
      });
  }

  private watchAuthStatusForWishlist(): void {
    combineLatest([
      this.store.select(selectIsLoggedIn),
      this.store.select(selectUserRole),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isLoggedIn, role]: [boolean, string | number | null]) => {
        const normalizedRole = normalizeRole(role as string | number | null | undefined);
        if (isLoggedIn && normalizedRole === Role.Admin) {
          this.items = [];
          this.cdr.detectChanges();
          return;
        }
        if (!isLoggedIn) {
          this.items = [];
          this.cdr.detectChanges();
          return;
        }
      });
  }

  private subscribeToCartStream(): void {
    this.store
      .select(selectCartItems)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: CartItem[]) => {
          this.items = (items || []).map((item: CartItem) => ({
            ...item,
            id: item.itemId ?? item.productId,
            name: item.productName,
            price: item.unitPrice,
            image: item.thumbnailUrl,
          }));
          this.cdr.detectChanges();
        },
      });
  }

  private watchAuthStatusForCart(): void {
    combineLatest([
      this.store.select(selectIsLoggedIn),
      this.store.select(selectUserRole),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isLoggedIn, role]: [boolean, string | number | null]) => {
        const normalizedRole = normalizeRole(role as string | number | null | undefined);
        if (isLoggedIn && normalizedRole === Role.Admin) {
          this.items = [];
          this.cdr.detectChanges();
          return;
        }
        if (!isLoggedIn) {
          this.items = [];
          this.cdr.detectChanges();
          return;
        }
      });
  }

  open(): void {
    this.drawer.open();
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
    return this.items.reduce((sum: number, item: SidePanelItem) => {
      const price = item.price || item.unitPrice || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);
  }

  get totalQuantity(): number {
    return this.items.reduce(
      (sum: number, item: SidePanelItem) => sum + (item.quantity || 1),
      0,
    );
  }

  loadWishlistItems(): void {
    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn: boolean) => {
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

  viewProductDetails(item: SidePanelItem): void {
    const productId = item.productId || item.id;
    if (!productId) {
      this.notificationService.showError('Product information is not available.');
      return;
    }

    this.close();
    this.router.navigate(['/products', productId]);
  }

  navigateToCheckout(): void {
    this.close();
    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this.router.navigate(['/checkout']);
        } else {
          this.notificationService.showInfo(
            'Please log in to proceed to checkout.',
            'Close',
          );
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: '/checkout' },
          });
        }
      });
  }

  handleRemove(itemId: string | number): void {
    if (this.type === 'Cart') {
      this.confirmDialog
        .confirm(
          'Are you sure you want to remove this item from your cart?',
          'Remove',
          'Cancel',
        )
        .pipe(take(1))
        .subscribe((confirmed) => {
          if (confirmed) this.removeCartItem(itemId);
        });
    } else if (this.type === 'WishList') {
      this.confirmDialog
        .confirm(
          'Are you sure you want to remove this item from your wishlist?',
          'Remove',
          'Cancel',
        )
        .pipe(take(1))
        .subscribe((confirmed) => {
          if (confirmed) this.removeWishlistItem(itemId);
        });
    }
  }

  private removeCartItem(itemId: string | number): void {
    this.store.dispatch(CartActions.deleteCartItem({ itemId: String(itemId) }));
  }

  private removeWishlistItem(productId: string | number): void {
    this.store.dispatch(WishlistActions.removeFromWishlist({ productId: String(productId) }));
  }

  handleQuantity(event: {
    id: string | number;
    action: 'add' | 'subtract';
  }): void {
    if (this.type !== 'Cart') return;
    const item: SidePanelItem | undefined = this.items.find(
      (i: SidePanelItem) => i.id === event.id || i.productId === event.id,
    );
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

  private confirmAndRemoveItem(itemId: string | number): void {
    this.confirmDialog
      .confirm(
        'Setting the quantity to 0 will delete this item from your cart. Do you want to proceed?',
        'Delete',
        'Cancel',
      )
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) this.removeCartItem(itemId);
      });
  }

  private verifyStockAndUpdateQuantity(
    item: SidePanelItem,
    newQty: number,
  ): void {
    const productId = item.productId;
    if (productId === undefined) {
      this.notificationService.showError(
        'Product information is not available.'
      );
      return;
    }

    this.store.dispatch(
      ProductActions.loadProductById({ id: productId }),
    );

    this.actions$
      .pipe(
        ofType(
          ProductActions.loadProductByIdSuccess,
          ProductActions.loadProductByIdFailure,
        ),
        takeUntil(this.destroy$),
        take(1),
      )
      .subscribe((action) => {
        if (action.type === '[Product] Load Product By Id Success') {
          const product = action.product;
          const stock = product.stockQuantity;
          if (stock !== undefined && newQty > stock) {
            this.notificationService.showError(
              `Only ${stock} items are available in stock.`,
              'Close',
            );
            return;
          }
        }
        this.updateCartItemQuantity(item.id, newQty);
      });
  }

  private updateCartItemQuantity(itemId: string | number, newQty: number): void {
    this.store.dispatch(
      CartActions.updateCartItem({ itemId: String(itemId), quantity: newQty }),
    );
  }

  handleMoveToCart(item: SidePanelItem): void {
    if (this.type !== 'WishList') return;

    const productId = item.productId || item.id;
    if (!productId) return;

    const productDetails: CartProductDetails = {
      productName: item.productName || item.name,
      unitPrice: item.unitPrice || item.price,
      thumbnailUrl: item.thumbnailUrl || item.image,
    };

    this.store.dispatch(
      CartActions.addToCart({
        productId: productId.toString(),
        quantity: 1,
        productDetails,
      }),
    );

    this.actions$
      .pipe(
        ofType(CartActions.addToCartSuccess),
        takeUntil(this.destroy$),
        take(1),
      )
      .subscribe(() => {
        this.removeWishlistItem(productId);
      });
  }

  moveAllToCart(): void {
    if (this.type !== 'WishList' || !this.items || this.items.length === 0)
      return;

    // Copy items to a new array to prevent issues when items are removed during iteration
    const itemsToMove = [...this.items];
    itemsToMove.forEach((item) => {
      this.handleMoveToCart(item);
    });

    this.close();
    this.notificationService.showSuccess(
      'All items moved to cart successfully',
      'Close',
    );
  }

  removeNotification(id: string | number): void {
    if (this.type !== 'Notification') return;
    this.items = this.items.filter(item => item.id !== id);
    this.cdr.detectChanges();
  }

  clearAllNotifications(): void {
    if (this.type !== 'Notification') return;
    this.items = [];
    this.cdr.detectChanges();
  }
}
