import { OrderService } from './../../../../core/services/order.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../../core/store/auth/auth.selectors';
import { map, take, takeUntil } from 'rxjs/operators';
import { WishListItem } from '../../../../core/models/wishList.model';
import { Location } from '@angular/common';
import * as WishlistActions from '../../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../../core/store/wish-list/wishList.selectors';
import { Observable, of, Subject } from 'rxjs';
import * as ProductActions from '../../../../core/store/product/product.action';
import * as CartActions from '../../../../core/store/cart/cart.actions';
import { CartProductDetails } from '../../../../core/models/cart.model';

import {
  selectProductById,
  selectProductsLoading,
  selectProductError,
  selectRelatedProducts,
} from '../../../../core/store/product/product.selectors';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private notification = inject(NotificationService);
  private location = inject(Location);
  private OrderService = inject(OrderService);

  product: Product | null = null;
  selectedImageUrl: string = '';
  quantity: number = 1;
  isLoading: boolean = true;

  isFavorite$!: Observable<boolean>;
  relatedProducts: Product[] = [];

  private destroy$ = new Subject<void>();
  private productDestroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        this.checkWishlistStatus(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.productDestroy$.next();
    this.productDestroy$.complete();
  }

  loadProduct(id: string): void {
    this.productDestroy$.next();

    this.store.dispatch(ProductActions.loadProductById({ id }));
    this.store
      .select(selectProductById(id))
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((product) => {
        if (product) {
          this.product = product;
          this.setInitialImage(product);
          this.loadRelatedProducts();
        }
      });

    this.store
      .select(selectRelatedProducts)
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((products) => {
        if (products && this.product) {
          this.relatedProducts = products
            .filter(
              (p: Product) => p.id.toString() !== this.product?.id.toString(),
            )
            .slice(0, 4);
        }
      });

    this.store
      .select(selectProductsLoading)
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((loading) => {
        this.isLoading = loading;
      });
    this.store
      .select(selectProductError)
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((error) => {
        if (error) {
          this.notification.showError(error);
        }
      });
  }

  private setInitialImage(product: Product): void {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      this.selectedImageUrl = primary
        ? primary.imageUrl
        : product.images[0].imageUrl;
    } else if (product.thumbnailUrl) {
      this.selectedImageUrl = product.thumbnailUrl;
    }
  }

  selectImage(url: string): void {
    this.selectedImageUrl = url;
  }

  incrementQuantity(): void {
    if (this.product && this.product.stockQuantity) {
      if (this.quantity < this.product.stockQuantity) {
        this.quantity++;
      }
    } else {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  checkWishlistStatus(productId: string): void {
    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          this.isFavorite$ = of(false);
          return;
        }
        this.isFavorite$ = this.store.select(selectWishlistItems).pipe(
          map((items: WishListItem[]) => {
            if (!items) return false;
            return items.some(
              (item: WishListItem) =>
                (item.productId || item.id).toString() === productId.toString(),
            );
          }),
        );
        this.store.dispatch(WishlistActions.loadWishlist());
      });
  }

  addToCart(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    // Product object pass kiya hai taaki guest user ke liye local storage mein details save ho sakein
    const productDetails: CartProductDetails = {
      productName: this.product.name,
      unitPrice: this.product.price,
      thumbnailUrl: this.selectedImageUrl || this.product.thumbnailUrl,
    };
    this.store.dispatch(
      CartActions.addToCart({
        productId,
        quantity: this.quantity,
        productDetails,
      }),
    );
  }

  addToWishlist(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          this.notification.showError(
            'Please login to add products to your wishlist.',
          );
          this.router.navigate(['/login']);
          return;
        }

        this.isFavorite$.pipe(take(1)).subscribe((isFav) => {
          if (isFav) {
            this.store.dispatch(
              WishlistActions.removeFromWishlist({ productId }),
            );
          } else {
            this.store.dispatch(WishlistActions.addToWishlist({ productId }));
          }
        });
      });
  }

  buyNow(): void {
    if (!this.product?.id) {
      this.notification.showError('Product information is not available');
      return;
    }

    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          this.notification.showInfo('Please log in to proceed to checkout.');
          this.router.navigate(['/login']);
          return;
        }

        const productId = this.product!.id.toString();
        this.router.navigate(['/checkout'], {
          queryParams: {
            productId: productId,
            quantity: this.quantity,
          },
        });
      });
  }

  goBack(): void {
    this.location.back();
  }

  private loadRelatedProducts(): void {
    if (!this.product?.id) return;
    this.store.dispatch(
      ProductActions.loadRelatedProducts({
        productId: this.product.id.toString(),
      }),
    );
  }
}
