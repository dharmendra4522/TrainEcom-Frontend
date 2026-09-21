import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, Data, Params } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../../core/store/auth/auth.selectors';
import { map, take, takeUntil } from 'rxjs/operators';
import { WishListItem } from '../../../../core/models/wishList.model';
import { Location } from '@angular/common';
import * as WishlistActions from '../../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../../core/store/wish-list/wishList.selectors';
import { Observable, of, Subject, combineLatest } from 'rxjs';
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
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';

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
  private portalRoutes = inject(PortalRouteService);

  product: Product | null = null;
  selectedImageUrl: string = '';
  quantity: number = 1;
  isLoading: boolean = true;
  isManagementMode: boolean = false;
  portal: PortalKey = 'admin';
  isReadOnly: boolean = false;

  isFavorite$!: Observable<boolean>;
  relatedProducts: Product[] = [];
  productBreadcrumbs: { label: string; url?: string }[] = [];

  private destroy$ = new Subject<void>();
  private productDestroy$ = new Subject<void>();

  // Product Features for Display
  productFeatures = [
    { icon: 'local_shipping', title: 'Free Delivery', subtitle: 'Orders over $50', hasBorder: false },
    { icon: 'published_with_changes', title: '30 Days Return', subtitle: 'Hassle free policy', hasBorder: true },
    { icon: 'verified_user', title: 'Secure Payment', subtitle: '100% Protected', hasBorder: false }
  ];

  ngOnInit(): void {
    this.initializeRouteListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.productDestroy$.next();
    this.productDestroy$.complete();
  }

  // --- Route Handling Method ---
  private initializeRouteListeners(): void {
    combineLatest([
      this.route.data,
      this.route.queryParams,
      this.route.params
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([data, queryParams, params]: [Data, Params, Params]) => {
        this.isManagementMode = data['pageMode'] === 'management';
        this.portal = this.portalRoutes.currentPortal() ?? 'admin';
        this.isReadOnly = queryParams['mode'] === 'view-only';

        const id = params['id'] as string;
        if (id) {
          this.loadProduct(id);
          if (!this.isManagementMode) {
            this.checkWishlistStatus(id);
          }
        }
      });
  }

  // method to load product details and related products
  loadProduct(id: string): void {
    this.productDestroy$.next();
    this.dispatchProductActions(id);
    this.setupProductSubscriptions(id);
    this.setupStatusSubscriptions();
  }

  // Store dispatch and subscription setup methods
  private dispatchProductActions(id: string): void {
    this.store.dispatch(ProductActions.loadProductById({
      id,
      portal: this.isManagementMode ? this.portal : undefined,
    }));
    if (!this.isManagementMode) {
      this.store.dispatch(ProductActions.loadRelatedProducts({ productId: id }));
    }
  }

  // Subscription setup methods for product and related products
  private setupProductSubscriptions(id: string): void {
    this.store
      .select(selectProductById(id))
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((product: Product | undefined) => this.handleProductLoaded(product));

    if (!this.isManagementMode) {
      this.store
        .select(selectRelatedProducts)
        .pipe(takeUntil(this.productDestroy$))
        .subscribe((products: Product[] | undefined) => this.handleRelatedProductsLoaded(products));
    }
  }


  // Subscription setup for loading and error states
  private setupStatusSubscriptions(): void {
    this.store
      .select(selectProductsLoading)
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((loading: boolean) => this.isLoading = loading);

    this.store
      .select(selectProductError)
      .pipe(takeUntil(this.productDestroy$))
      .subscribe((error: string | null) => {
        if (error) this.notification.showError(error);
      });
  }


  // Handlers for product and related products loading
  private handleProductLoaded(product: Product | undefined): void {
    if (!product) return;
    this.product = product;
    this.setInitialImage(product);
    this.updateBreadcrumbs(product);
  }


  // Handler for related products loading
  private handleRelatedProductsLoaded(products: Product[] | undefined): void {
    if (products && this.product) {
      this.relatedProducts = products.filter(
        (p: Product) => p.id.toString() !== this.product?.id.toString()
      );
    }
  }

  // --- Breadcrumbs Update Method ---
  private updateBreadcrumbs(product: Product): void {
    if (this.isManagementMode) {
      this.productBreadcrumbs = [
        { label: 'Dashboard', url: '/' },
        { label: 'Products List', url: `/${this.portal}/products/manage` },
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

  // --- Image & Quantity Helpers ---
  private setInitialImage(product: Product): void {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      this.selectedImageUrl = primary ? primary.imageUrl : product.images[0].imageUrl;
    } else if (product.thumbnailUrl) {
      this.selectedImageUrl = product.thumbnailUrl;
    }
  }

  selectImage(url: string): void {
    this.selectedImageUrl = url;
  }

  incrementQuantity(): void {
    if (!this.product?.stockQuantity || this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // --- Auth & Cart / Wishlist Actions ---
  private executeWithAuth(action: () => void, unauthenticatedHandler: () => void): void {
    this.store
      .select(selectIsLoggedIn)
      .pipe(take(1))
      .subscribe((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          action();
        } else {
          unauthenticatedHandler();
        }
      });
  }

  // Wishlist Status Check
  checkWishlistStatus(productId: string): void {
    this.executeWithAuth(
      () => {
        this.isFavorite$ = this.store.select(selectWishlistItems).pipe(
          map((items: WishListItem[]) => {
            if (!items) return false;
            return items.some(
              (item: WishListItem) =>
                (item.productId || item.id).toString() === productId.toString(),
            );
          }),
        );
      },
      () => {
        this.isFavorite$ = of(false);
      }
    );
  }

  // Cart and Wishlist Actions
  addToCart(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();
    const productDetails: CartProductDetails = {
      productName: this.product.name,
      unitPrice: this.product.price,
      thumbnailUrl: this.selectedImageUrl || this.product.thumbnailUrl,
    };
    this.store.dispatch(
      CartActions.addToCart({ productId, quantity: this.quantity, productDetails }),
    );
  }

  // Wishlist Actions
  addToWishlist(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    this.executeWithAuth(
      () => {
        this.isFavorite$.pipe(take(1)).subscribe((isFav: boolean) => {
          if (isFav) {
            this.store.dispatch(WishlistActions.removeFromWishlist({ productId }));
          } else {
            this.store.dispatch(WishlistActions.addToWishlist({ productId }));
          }
        });
      },
      () => {
        this.notification.showError('Please login to add products to your wishlist.');
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      }
    );
  }


  // handle "Buy Now" action
  buyNow(): void {
    if (!this.product?.id) {
      this.notification.showError('Product information is not available');
      return;
    }

    const productId = this.product.id.toString();
    const checkoutUrl = this.router
      .createUrlTree(['/checkout'], { queryParams: { productId, quantity: this.quantity } })
      .toString();

    this.executeWithAuth(
      () => {
        this.router.navigate(['/checkout'], { queryParams: { productId, quantity: this.quantity } });
      },
      () => {
        this.notification.showInfo('Please log in to proceed to checkout.');
        this.router.navigate(['/login'], { queryParams: { returnUrl: checkoutUrl } });
      }
    );
  }

  // --- Admin Specific Actions ---
  onEditProduct(): void {
    if (this.product) {
      this.router.navigate(this.portalRoutes.products(this.portal, 'edit', this.product.id));
    }
  }


  // Admin Specific Actions  for product delete 
  onDeleteProduct(): void {
    if (!this.product) return;
    this.confirmDialog
      .confirm('Are you sure you want to delete this product?', 'Delete', 'Cancel')
      .subscribe((confirmed: boolean) => {
        if (!confirmed || !this.product) return;
        const id = this.product.id.toString();
        this.store.dispatch(ProductActions.deleteProduct({ productId: id, portal: this.portal }));

        this.action$
          .pipe(ofType(ProductActions.deleteProductSuccess), takeUntil(this.destroy$), take(1))
          .subscribe(() => {
            this.router.navigate(this.portalRoutes.products(this.portal, 'manage'));
          });
      });
  }

  // --- Presentation Helpers ---
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

  goBack(): void {
    this.location.back();
  }
}
