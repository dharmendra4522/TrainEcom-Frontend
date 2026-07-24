import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';
import { map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Observable } from 'rxjs/internal/Observable';
import * as WishlistActions from '../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../core/store/wish-list/wishList.selectors';
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private store = inject(Store);
  private router = inject(Router);
  private cartService = inject(CartService);

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

 private checkWishlistStatus(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    // selectWishlistItems ka use karein na ki selectIsLoggedIn ka
    this.isFavorite$ = this.store.select(selectWishlistItems).pipe(
      map((items: any[]) => {
        if (!items) return false;
        return items.some((item: any) => (item.productId || item.id).toString() === productId);
      })
    );
  }


  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe((isLoggedIn) => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }

      this.isFavorite$.pipe(take(1)).subscribe((isFav) => {
        if (isFav) {
          this.store.dispatch(WishlistActions.removeFromWishlist({ productId }));
          this.wishListToggle.emit(productId);
        } else {
          this.store.dispatch(WishlistActions.addToWishlist({ productId }));
          this.wishListToggle.emit(productId);
        }
      });
    });
  }



  addToCart(product: Product): void {
    const productDetails: Record<string, unknown> = {
      productName: product.name,
      unitPrice: product.price,
      thumbnailUrl: product.thumbnailUrl,
      stockQuantity: product.stockQuantity
    };
    this.cartService.addToCart(product.id.toString(), 1, productDetails).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(`Added ${product.name} to cart!`, 'Close');
        this.addToCartEvent.emit(product);
      },
      error: (err) => {
        console.error('Failed to add to cart:', err);
        this.notificationService.showError('Could not add to cart', 'Close');
      }
    });
  }
}