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
import { Actions, ofType } from '@ngrx/effects';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';

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
  private confirmDialog = inject(ConfirmDialogServiceService);
  private action$ = inject(Actions);

  product: Product | null = null;
  selectedImageUrl: string = '';
  quantity: number = 1;
  isLoading: boolean = true;
  isAdmin: boolean = false; // for routes check
  isReadOnly: boolean = false; // for routes check

  isFavorite$!: Observable<boolean>;
  relatedProducts: Product[] = [];

  productBreadcrumbs: { label: string; url?: string }[] = [];

  private destroy$ = new Subject<void>();
  private productDestroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.isAdmin = !!data['isAdmin'];
    });
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.isReadOnly = params['mode'] === 'view-only';
    });
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        if (!this.isAdmin) {
          this.checkWishlistStatus(id);
        }
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
    if (!this.isAdmin) {
      this.store.dispatch(
        ProductActions.loadRelatedProducts({ productId: id }),
      );
    }

    this.store
      .select(selectProductById(id))
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((product) => {
        if (product) {
          this.product = product;
          this.setInitialImage(product);

          if (this.isAdmin) {
            this.productBreadcrumbs = [
              { label: 'Home', url: '/' },
              { label: 'Admin Products', url: '/admin/products/manage' },
              { label: product.name },
            ];
          } else {
            this.productBreadcrumbs = [
              { label: 'Home', url: '/' },
              { label: 'Products', url: '/products' },
              { label: product.name },
            ];
          }
        }
      });

    if (!this.isAdmin) {
      this.store
        .select(selectRelatedProducts)
        .pipe(takeUntil(this.productDestroy$))
        .subscribe((products) => {
          if (products && this.product) {
            this.relatedProducts = products
              .filter(
                (p: Product) => p.id.toString() !== this.product?.id.toString(),
              )
          }
        });
    }

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
      });
  }

  addToCart(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

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
          const checkoutUrl = this.router
            .createUrlTree(['/checkout'], {
              queryParams: {
                productId: this.product!.id.toString(),
                quantity: this.quantity,
              },
            })
            .toString();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: checkoutUrl },
          });
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

  private loadRelatedProducts(): void {
    if (!this.product?.id) return;
    this.store.dispatch(
      ProductActions.loadRelatedProducts({
        productId: this.product.id.toString(),
      }),
    );
  }

  // Admin specific methods
  onEditProduct(): void {
    if (this.product) {
      this.router.navigate(['/admin/products/edit', this.product.id]);
    }
  }

  onDeleteProduct(): void {
    if (!this.product) return;
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this product?',
        'Delete',
        'Cancel',
      )
      .subscribe((confirmed) => {
        if (!confirmed || !this.product) return;
        const id = this.product.id.toString();
        this.store.dispatch(ProductActions.deleteProduct({ productId: id }));

        this.action$
          .pipe(
            ofType(ProductActions.deleteProductSuccess),
            takeUntil(this.destroy$),
            take(1),
          )
          .subscribe(() => {
            this.router.navigate(['/admin/products/manage']);
          });
      });
  }

  getStarArray(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('star');
      } else if (rating >= i - 0.5) {
        stars.push('star_half');
      } else {
        stars.push('star_border');
      }
    }
    return stars;
  }
  // Features metadata array for looping
  productFeatures = [
    {
      icon: 'local_shipping',
      title: 'Free Delivery',
      subtitle: 'Orders over $50',
      hasBorder: false
    },
    {
      icon: 'published_with_changes',
      title: '30 Days Return',
      subtitle: 'Hassle free policy',
      hasBorder: true
    },
    {
      icon: 'verified_user',
      title: 'Secure Payment',
      subtitle: '100% Protected',
      hasBorder: false
    }
  ];


  goBack(): void {
    this.location.back();
  }
}
