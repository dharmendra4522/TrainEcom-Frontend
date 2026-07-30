import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { WishListItem } from '../../../../core/models/wishList.model';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../../core/services/notification.service';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import * as WishlistActions from '../../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../../core/store/wish-list/wishList.selectors';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts } from '../../../../core/store/product/product.selectors';
import * as CartActions from '../../../../core/store/cart/cart.actions';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, Subject, take } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private actions$ = inject(Actions);
  private destroy$ = new Subject<void>();

  wishlist$!: Observable<Product[]>;
  justForYouItems: Product[] = [];

  ngOnInit(): void {
    this.initWishlist();
    this.loadRecommendations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initWishlist(): void {
    this.wishlist$ = this.store
      .select(selectWishlistItems)
      .pipe(map((items: WishListItem[]) => this.mapWishlistToProducts(items)));

    this.store.select(selectWishlistItems).pipe(take(1)).subscribe((items) => {
      if (!items || items.length === 0) {
        this.store.dispatch(WishlistActions.loadWishlist());
      }
    });
  }

  private loadRecommendations(): void {
    this.store.dispatch(ProductActions.loadProducts({ pageNumber: 1, pageSize: 4 }));
    this.store
      .select(selectAllProducts)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          if (products) {
            this.justForYouItems = (products || []).slice(0, 4);
            this.cdr.detectChanges();
          }
        },
        error: (err: unknown) => {
          console.error('Failed to load recommendations:', err);
          this.notificationService.showError('Could not load recommendations', 'Close');
        },
      });
  }

  private mapWishlistToProducts(items: WishListItem[]): Product[] {
    return (items || []).map((item) => ({
      id: item.productId || item.id || '',
      name: item.productName || item.name || '',
      description: item.description || '',
      price: item.price || 0,
      brandName: item.brandName || '',
      categoryName: item.categoryName || '',
      stockQuantity: item.stockQuantity,
      thumbnailUrl: item.thumbnailUrl || item.image || '',
      images: [
        {
          id: 'img-' + (item.productId || item.id),
          imageUrl: item.thumbnailUrl || item.image || '',
          isPrimary: true,
        },
      ],
    }));
  }

  removeFromWishlist(item: Product): void {
    this.store.dispatch(
      WishlistActions.removeFromWishlist({ productId: item.id.toString() }),
    );
  }

  addToCart(item: Product): void {
    const productDetails = {
      productName: item.name,
      unitPrice: item.price,
      thumbnailUrl: item.thumbnailUrl || (item.images && item.images.length > 0 ? item.images[0].imageUrl : ''),
    };

    this.store.dispatch(
      CartActions.addToCart({
        productId: item.id.toString(),
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
        this.removeFromWishlist(item);
      });
  }

  moveAllToBag(): void {
    this.wishlist$.pipe(take(1)).subscribe((items) => {
      if (!items || items.length === 0) return;
      
      const itemsToMove = [...items];
      itemsToMove.forEach(item => {
        this.addToCart(item);
      });
      
      this.notificationService.showSuccess('All items moved to cart successfully', 'Close');
    });
  }

  seeAllRecommendations(): void {
    this.router.navigate(['/products']);
  }
}
