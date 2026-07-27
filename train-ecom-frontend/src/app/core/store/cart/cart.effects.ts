import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import * as CartActions from './cart.actions';
import * as AuthActions from '../auth/auth.actions';
import { map, catchError, of, exhaustMap, mergeMap, concatMap } from 'rxjs';

@Injectable()
export class CartEffects {
  private actions$ = inject(Actions);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  loadCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.loadCart),
      exhaustMap(() => {
        return this.cartService.getCartItems().pipe(
          map((cartResponse) => {
            return CartActions.loadCartSuccess({ cart: cartResponse });
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message || error?.message || 'Failed to load cart';
            this.notification.showError(errMsg);
            return of(CartActions.loadCartFailure({ error: errMsg }));
          })
        );
      })
    );
  });

  addToCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.addToCart),
      mergeMap((action) => {
        return this.cartService
          .addToCart(action.productId, action.quantity, action.productDetails)
          .pipe(
            map((cartResponse) => {
              this.notification.showSuccess(
                'Item added to cart successfully',
                'Close'
              );
              return CartActions.addToCartSuccess({ cart: cartResponse });
            }),
            catchError((error) => {
              const errMsg =
                error?.error?.message ||
                error?.message ||
                'Failed to add item to cart';
              this.notification.showError(errMsg);
              return of(CartActions.addToCartFailure({ error: errMsg }));
            })
          );
      })
    );
  });

  updateCartItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.updateCartItem),
      concatMap((action) => {
        return this.cartService
          .updateCartItem(action.itemId, action.quantity)
          .pipe(
            map((cartResponse) => {
              this.notification.showSuccess(
                'Cart item updated successfully',
                'Close'
              );
              return CartActions.updateCartItemSuccess({ cart: cartResponse });
            }),
            catchError((error) => {
              const errMsg =
                error?.error?.message ||
                error?.message ||
                'Failed to update cart item';
              this.notification.showError(errMsg);
              return of(CartActions.updateCartItemFailure({ error: errMsg }));
            })
          );
      })
    );
  });

  deleteCartItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.deleteCartItem),
      mergeMap((action) => {
        return this.cartService.deleteCartItem(action.itemId).pipe(
          map((cartResponse) => {
            this.notification.showSuccess(
              'Cart item deleted successfully',
              'Close'
            );
            return CartActions.deleteCartItemSuccess({ cart: cartResponse });
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message ||
              error?.message ||
              'Failed to delete cart item';
            this.notification.showError(errMsg);
            return of(CartActions.deleteCartItemFailure({ error: errMsg }));
          })
        );
      })
    );
  });

  clearCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.clearCart),
      exhaustMap(() => {
        return this.cartService.clearCart().pipe(
          map((cartResponse) => {
            this.notification.showSuccess('Cart cleared successfully', 'Close');
            return CartActions.clearCartSuccess({ cart: cartResponse });
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message || error?.message || 'Failed to clear cart';
            this.notification.showError(errMsg);
            return of(CartActions.clearCartFailure({ error: errMsg }));
          })
        );
      })
    );
  });

  mergeCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CartActions.mergeCart),
      exhaustMap((action) => {
        return this.cartService.mergeCart(action.cartItems).pipe(
          map((cartResponse) => {
            this.notification.showSuccess('Cart merged successfully', 'Close');
            return CartActions.mergeCartSuccess({ cart: cartResponse });
          }),
          catchError((error) => {
            const errMsg =
              error?.error?.message || error?.message || 'Failed to merge cart';
            this.notification.showError(errMsg);
            return of(CartActions.mergeCartFailure({ error: errMsg }));
          })
        );
      })
    );
  });

  loginSuccessCartLoad$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map(() => {
        return CartActions.loadCart();
      })
    );
  });
}
