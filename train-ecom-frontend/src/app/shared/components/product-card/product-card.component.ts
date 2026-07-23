import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { WishListService } from '../../../core/services/wish-list.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';
import { take } from 'rxjs/operators';

import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  private wishListService = inject(WishListService);
  private notificationService = inject(NotificationService);
  private store = inject(Store);
  private router = inject(Router);

  @Input() product!: Product;
  @Output() wishListToggle = new EventEmitter<string>();
  @Output() addToCartEvent = new EventEmitter<Product>();

  isFavorite: boolean = false;

  public static wishlistCache: Set<string> = new Set();
  public static isInitialized: boolean = false;
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  ngOnInit(): void {
    this.checkWishlistStatus();
  }

  private checkWishlistStatus(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.isFavorite = false;
        return;
      }

      if (ProductCardComponent.isInitialized) {
        this.isFavorite = ProductCardComponent.wishlistCache.has(productId);
        return;
      }

      this.wishListService.getWishList().subscribe({
        next: (items) => {
          ProductCardComponent.wishlistCache = new Set(items.map((i: any) => (i.productId || i.id).toString()));
          ProductCardComponent.isInitialized = true;
          this.isFavorite = ProductCardComponent.wishlistCache.has(productId);
        },
        error: () => {
          this.fetchIndividualStatus(productId);
        }
      });
    });
  }

  private fetchIndividualStatus(productId: string): void {
    this.wishListService.checkInWishlist(productId).subscribe({
      next: (status: boolean) => {
        this.isFavorite = status;
      },
      error: (err) => {
        console.error('Failed to check wishlist status:', err);
      }
    });
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    if (this.isFavorite) {
      this.wishListService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.isFavorite = false;
          ProductCardComponent.wishlistCache.delete(productId);
          this.notificationService.showSuccess('Removed from wishlist', 'Close');
          this.wishListToggle.emit(productId);
        },
        error: (err) => {
          console.error('Failed to remove from wishlist:', err);
          this.notificationService.showError('Could not remove from wishlist', 'Close');
        }
      });
    } else {
      this.wishListService.addToWishlist(productId).subscribe({
        next: () => {
          this.isFavorite = true;
          ProductCardComponent.wishlistCache.add(productId);
          this.notificationService.showSuccess('Added to wishlist', 'Close');
          this.wishListToggle.emit(productId);
        },
        error: (err) => {
          console.error('Failed to add to wishlist:', err);
          this.notificationService.showError('Could not add to wishlist', 'Close');
        }
      });
    }
  }

  addToCart(product: Product): void {
    this.addToCartEvent.emit(product);
  }
}