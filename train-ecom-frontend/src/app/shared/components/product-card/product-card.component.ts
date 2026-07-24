import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { WishListService } from '../../../core/services/wish-list.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../core/store/auth/auth.selectors';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
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
  private cartService = inject(CartService);

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
    
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.handleLoggedOutState();
      } else {
        this.handleLoggedInState(this.product.id.toString());
      }
    });
  }

  
  private handleLoggedOutState(): void {
    this.isFavorite = false;
  }

  // yeha hum ProductCardComponent isliye static properties ka use kar rahe hain taki wishlist status ko cache kiya ja sake aur baar-baar server call na ho. Agar user logged in hai, to hum check karte hain ki product wishlist me hai ya nahi, aur agar cache initialized nahi hai to server se fetch karte hain.
  private handleLoggedInState(productId: string): void {
    if (ProductCardComponent.isInitialized) {
      this.isFavorite = ProductCardComponent.wishlistCache.has(productId);
      return;
    }

    this.fetchWishlistFromServer(productId);
  }

  private fetchWishlistFromServer(productId: string): void {
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
  }

//  Fetch individual product's wishlist status if the full wishlist fetch fails
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
      this.removeProductFromWishlist(productId);
    } else {
      this.addProductToWishlist(productId);
    }
  }

  private removeProductFromWishlist(productId: string): void {
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
  }

  private addProductToWishlist(productId: string): void {
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