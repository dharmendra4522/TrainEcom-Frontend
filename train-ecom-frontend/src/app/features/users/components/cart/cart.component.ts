import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartItem } from '../../../../core/models/cart.model';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs/operators';
import * as ProductActions from '../../../../core/store/product/product.action';
import * as CartActions from '../../../../core/store/cart/cart.actions';
import { Observable } from 'rxjs/internal/Observable';
import {
  selectCartItems,
  selectCartTotalAmount,
  selectCartTotalQuantity,
  selectCartLoading,
} from '../../../../core/store/cart/cart.selectors';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  private router = inject(Router);
  private notification = inject(NotificationService);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private confirmDialog = inject(ConfirmDialogServiceService);

  cartItems$: Observable<CartItem[]> = this.store.select(selectCartItems);
  subtotal$: Observable<number> = this.store.select(selectCartTotalAmount);
  totalQuantity$: Observable<number> = this.store.select(
    selectCartTotalQuantity,
  );
  loading$: Observable<boolean> = this.store.select(selectCartLoading);

  couponCode: string = '';

  ngOnInit(): void {
    this.loadCartItems();
  }

  private loadCartItems(): void {
    this.cartItems$.pipe(take(1)).subscribe((items) => {
      if (!items || items.length === 0) {
        this.store.dispatch(CartActions.loadCart());
      }
    });
  }

  updateQuantity(productId: string | number, action: 'add' | 'subtract'): void {
    this.cartItems$.pipe(take(1)).subscribe((items) => {
      const item = items.find(
        (i) => i.productId === productId || i.itemId === productId,
      );
      if (!item) return;

      const currentQty = item.quantity || 1;
      const newQty = action === 'add' ? currentQty + 1 : currentQty - 1;

      if (newQty <= 0) {
        this.confirmAndDeleteItem(productId);
        return;
      }
      if (action === 'add') {
        this.verifyStockAndExecuteUpdate(item, newQty);
      } else {
        this.executeCartUpdate(item, newQty);
      }
    });
  }

  private confirmAndDeleteItem(productId: string | number): void {
    this.confirmDialog.confirm(
      'Setting the quantity to 0 will delete this item from your cart. Do you want to proceed?',
      'Delete',
      'Cancel',
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.removeItem(productId, false);
      }
    });
  }

  private verifyStockAndExecuteUpdate(item: CartItem, newQty: number): void {
    const productId = item.productId.toString();
    this.store.dispatch(ProductActions.loadProductById({ id: productId }));

    this.actions$
      .pipe(
        ofType(
          ProductActions.loadProductByIdSuccess,
          ProductActions.loadProductByIdFailure,
        ),
        take(1),
      )
      .subscribe((action) => {
        if (action.type === '[Product] Load Product By Id Success') {
          const product = action.product;
          const stock = product.stockQuantity;
          if (stock !== undefined && newQty > stock) {
            this.notification.showError(
              `Only ${stock} items are available in stock.`,
              'Close',
            );
            return;
          }
        }
        this.executeCartUpdate(item, newQty);
      });
  }

  private executeCartUpdate(item: CartItem, newQty: number): void {
    const targetId = item.itemId
      ? item.itemId.toString()
      : item.productId.toString();

    this.store.dispatch(
      CartActions.updateCartItem({ itemId: targetId, quantity: newQty }),
    );
  }

  removeItem(productId: string | number, forceConfirm: boolean = true): void {
    this.cartItems$.pipe(take(1)).subscribe((items) => {
      const item = items.find(
        (i) => i.productId === productId || i.itemId === productId,
      );
      if (!item) return;

      if (forceConfirm) {
        this.confirmDialog.confirm(
          `Are you sure you want to remove "${item.productName || 'this item'}" from your cart?`,
          'Remove',
          'Cancel',
        ).subscribe((confirmed) => {
          if (confirmed) {
            this.dispatchRemoveItem(item);
          }
        });
        return;
      }

      this.dispatchRemoveItem(item);
    });
  }

  private dispatchRemoveItem(item: CartItem): void {
    const targetId = item.itemId
      ? item.itemId.toString()
      : item.productId.toString();

    this.store.dispatch(CartActions.deleteCartItem({ itemId: targetId }));
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    this.cartItems$.pipe(take(1)).subscribe((items) => {
      if (items.length === 0) {
        this.notification.showInfo(
          'Your cart is empty. Please add items before proceeding to checkout.',
          'Close',
        );
        return;
      }
      this.notification.showSuccess('Proceeding to checkout!', 'Close');
      this.router.navigate(['/checkout']);
    });
  }
}
