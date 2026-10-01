import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import * as CartActions from './cart.actions';
import * as AuthActions from '../auth/auth.actions';
import {
  map,
  catchError,
  of,
  exhaustMap,
  mergeMap,
  concatMap,
  switchMap,
  filter,
  tap,
  withLatestFrom,
} from 'rxjs';
import { CartResponse, CartWarning } from '../../models/cart.model';
import { Role } from '../../models/auth.model';
import {
  selectCartLoaded,
  selectCartItems,
  selectCartTotalQuantity,
  selectCartTotalAmount,
} from './cart.selectors';
import { normalizeRole } from '../../utils/role.utils';

@Injectable()
export class CartEffects {
  private actions$ = inject(Actions);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);
  private store = inject(Store);

  loadCartAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        filter(({ payload }) => {
          const role = normalizeRole(payload.role);
          return role !== Role.Admin && role !== Role.Vendor;
        }),
        tap(() => this.cartService.loadCart()),
      ),
    { dispatch: false },
  );

  /** Do not allow a guest-cart cache to leak into a later session. */
  clearCartCacheAfterLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => sessionStorage.removeItem('cart')),
      ),
    { dispatch: false },
  );

  loadCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.loadCart),
      withLatestFrom(
        this.store.select(selectCartLoaded),
        this.store.select(selectCartItems),
        this.store.select(selectCartTotalQuantity),
        this.store.select(selectCartTotalAmount),
      ),
      switchMap(([action, loaded, items, totalQuantity, totalAmount]) => {
        if (loaded && !action?.force) {
          return of(
            CartActions.loadCartSuccess({
              cart: { items, totalQuantity, totalAmount },
            }),
          );
        }
        return this.cartService.getCartItems().pipe(
          map((cartResponse) => {
            return CartActions.loadCartSuccess({ cart: cartResponse });
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message || error?.error?.Message || error?.message || 'Failed to load cart';
            return of(CartActions.loadCartFailure({ error: errMsg }));
          }),
        );
      }),
    );
  });

  addToCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.addToCart),
      mergeMap((action) => {
        return this.cartService
          .addToCart(String(action.productId), action.quantity, action.productDetails)
          .pipe(
            switchMap((response) => {
              return this.cartService.getCartItems().pipe(
                map((cartResponse) => {
                  this.notification.showSuccess(
                    'Item added to cart successfully',
                    'Close',
                  );
                  return CartActions.addToCartSuccess({ cart: cartResponse });
                }),
                catchError(() => {
                  return of(CartActions.addToCartSuccess({ cart: response }));
                }),
              );
            }),
            catchError((error) => {
              const errMsg =
                error?.error?.message ||
                error?.error?.Message ||
                error?.message ||
                'Failed to add item to cart';
              return of(CartActions.addToCartFailure({ error: errMsg }));
            }),
          );
      }),
    );
  });

  updateCartItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.updateCartItem),
      concatMap((action) => {
        return this.cartService
          .updateCartItem(String(action.itemId), action.quantity)
          .pipe(
            switchMap((response) => {
              return this.cartService.getCartItems().pipe(
                map((cartResponse) => {
                  this.notification.showSuccess(
                    'Cart item updated successfully',
                    'Close',
                  );
                  return CartActions.updateCartItemSuccess({
                    cart: cartResponse,
                  });
                }),
                catchError(() => {
                  return of(
                    CartActions.updateCartItemSuccess({ cart: response }),
                  );
                }),
              );
            }),
            catchError((error) => {
              const errMsg =
                error?.error?.message ||
                error?.error?.Message ||
                error?.message ||
                'Failed to update cart item';
              return of(CartActions.updateCartItemFailure({ error: errMsg }));
            }),
          );
      }),
    );
  });

  deleteCartItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.deleteCartItem),
      mergeMap((action) => {
        return this.cartService.deleteCartItem(String(action.itemId)).pipe(
          switchMap((response) => {
            return this.cartService.getCartItems().pipe(
              map((cartResponse) => {
                this.notification.showSuccess(
                  'Cart item deleted successfully',
                  'Close',
                );
                return CartActions.deleteCartItemSuccess({
                  cart: cartResponse,
                });
              }),
              catchError(() => {
                return of(
                  CartActions.deleteCartItemSuccess({ cart: response }),
                );
              }),
            );
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message ||
              error?.error?.Message ||
              error?.message ||
              'Failed to delete cart item';
            return of(CartActions.deleteCartItemFailure({ error: errMsg }));
          }),
        );
      }),
    );
  });

  clearCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.clearCart),
      exhaustMap(() => {
        return this.cartService.clearCart().pipe(
          switchMap((response) => {
            return this.cartService.getCartItems().pipe(
              map((cartResponse) => {
                this.notification.showSuccess(
                  'Cart cleared successfully',
                  'Close',
                );
                return CartActions.clearCartSuccess({ cart: cartResponse });
              }),
              catchError(() => {
                return of(CartActions.clearCartSuccess({ cart: response }));
              }),
            );
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message || error?.error?.Message || error?.message || 'Failed to clear cart';
            return of(CartActions.clearCartFailure({ error: errMsg }));
          }),
        );
      }),
    );
  });

  mergeCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.mergeCart),
      exhaustMap((action) => {
        return this.cartService.mergeCart(action.cartItems).pipe(
          switchMap((response: CartResponse) => {
            if (response && response.warnings && response.warnings.length > 0) {
              response.warnings.forEach((warning: CartWarning) => {
                this.notification.showWarning(
                  warning.message || `Stock issue with ${warning.productName}`,
                  'Close',
                );
              });
            } else {
              this.notification.showSuccess(
                'Cart merged successfully',
                'Close',
              );
            }
            return this.cartService.getCartItems().pipe(
              map((cartResponse) => {
                return CartActions.mergeCartSuccess({ cart: cartResponse });
              }),
              catchError(() => {
                return of(CartActions.mergeCartSuccess({ cart: response }));
              }),
            );
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message || error?.error?.Message || error?.message || 'Failed to merge cart';
            return of(CartActions.mergeCartFailure({ error: errMsg }));
          }),
        );
      }),
    );
  });
}

