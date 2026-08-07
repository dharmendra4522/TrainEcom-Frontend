import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';
import { map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import * as WishlistActions from '../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../core/store/wish-list/wishList.selectors';
import * as CartActions from '../../../core/store/cart/cart.actions';
import { CartProductDetails } from '../../../core/models/cart.model';
import { WishListItem } from '../../../core/models/wishList.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent implements OnInit {
  private notification = inject(NotificationService);
  private store = inject(Store);
  private router = inject(Router);

  @Input() product!: Product;
  @Output() wishListToggle = new EventEmitter<string>();
  @Output() addToCartEvent = new EventEmitter<Product>();

  isFavorite$!: Observable<boolean>;

  public static wishlistCache: Set<string> = new Set();
  public static isInitialized: boolean = false;

  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  ngOnInit(): void {
    this.checkWishlistStatus();
  }


  // Check if the product is in the wishlist and update the isFavorite$ observable
  private checkWishlistStatus(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    this.isFavorite$ = this.store.select(selectWishlistItems).pipe(
      map((items: WishListItem[]) => {
        if (!items) return false;
        return items.some(
          (item: WishListItem) => (item.productId || item.id).toString() === productId,
        );
      }),
    );
  }

  // Toggle the wishlist status of the product
  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
          return;
        }

        this.isFavorite$.pipe(take(1)).subscribe((isFav) => {
          if (isFav) {
            this.store.dispatch(
              WishlistActions.removeFromWishlist({ productId }),
            );
            this.wishListToggle.emit(productId);
          } else {
            this.store.dispatch(WishlistActions.addToWishlist({ productId }));
            this.wishListToggle.emit(productId);
          }
        });
      });
  }

  // Add the product to the cart
  addToCart(product: Product): void {
    if (this.addToCartEvent.observed || this.addToCartEvent.observers.length > 0) {
      this.addToCartEvent.emit(product);
    } else {
      const productDetails: CartProductDetails = {
        productName: product.name,
        unitPrice: product.price,
        thumbnailUrl: product.thumbnailUrl,
      };
      this.store.dispatch(
        CartActions.addToCart({
          productId: product.id.toString(),
          quantity: 1,
          productDetails,
        }),
      );
    }
  }

  // Handle the "Buy Now" action
  buyNow(): void {
    if (!this.product?.id) {
      this.notification.showError('Product information is not available');
      return;
    }

    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn: boolean) => {

        const checkoutUrl = this.router.createUrlTree(['/checkout'], {
          queryParams: { productId: this.product.id.toString(), quantity: 1 },
        }).toString();

        if (!isLoggedIn) {
          this.notification.showInfo('Please log in to proceed to checkout.');
          this.router.navigate(['/login'], { queryParams: { returnUrl: checkoutUrl } });
          return;
        }

        const productId = this.product.id.toString();
        this.router.navigate(['/checkout'], {
          queryParams: {
            productId: productId,
            quantity: 1,
          },
        });
      });
  }


}
