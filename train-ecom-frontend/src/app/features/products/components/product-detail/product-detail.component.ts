import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { WishListService } from '../../../../core/services/wish-list.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../../../core/store/auth/auth.selectors';
import { take } from 'rxjs/operators';
import { WishListItem } from '../../../../core/models/wishList.model';
import { Location } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private wishListService = inject(WishListService);
  private store = inject(Store);
  private notification = inject(NotificationService);
  private location = inject(Location);
  private cartService = inject(CartService);

  product: Product | null = null;
  selectedImageUrl: string = '';
  quantity: number = 1;
  isLoading: boolean = true;
  isFavorite: boolean = false;
  relatedProducts: Product[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        this.checkWishlistStatus(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.setInitialImage(data);
        this.isLoading = false;
        this.loadRelatedProducts();
      },
      error: (err) => {
        console.error('Failed to load product details:', err);
        this.notification.showError('Could not load product details.');
        this.isLoading = false;
      }
    });
  }

  private setInitialImage(product: Product): void {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.isPrimary);
      this.selectedImageUrl = primary ? primary.imageUrl : product.images[0].imageUrl;
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
    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.isFavorite = false;
        return;
      }
      this.wishListService.wishlistItems$.subscribe({
        next: (items: WishListItem[]) => {
          this.isFavorite = (items || []).some(
            (item) => (item.productId || item.id).toString() === productId.toString()
          );
        }
      });
      this.wishListService.loadWishlist();
    });
  }

  addToCart(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();
    this.cartService.addToCart(productId, this.quantity).subscribe({
      next: () => {
        this.notification.showSuccess(`${this.quantity} item(s) added to cart!`);
      },
      error: (err) => {
        console.error('Failed to add to cart:', err);
        this.notification.showError('Failed to add to cart');
      }
    })
  }

  addToWishlist(): void {
    if (!this.product?.id) return;
    const productId = this.product.id.toString();

    this.store.select(selectIsLoggedIn).pipe(take(1)).subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.notification.showError('Please login to add products to your wishlist.');
        this.router.navigate(['/login']);
        return;
      }

      if (this.isFavorite) {
        this.wishListService.removeFromWishlist(productId).subscribe({
          next: () => {
            this.isFavorite = false;
            this.notification.showSuccess('Removed from wishlist');
          },
          error: (err: unknown) => {
            console.error('Failed to remove from wishlist:', err);
            this.notification.showError('Failed to remove from wishlist');
          }
        });
      } else {
        this.wishListService.addToWishlist(productId).subscribe({
          next: () => {
            this.isFavorite = true;
            this.notification.showSuccess('Added to wishlist');
          },
          error: (err: unknown) => {
            console.error('Failed to add to wishlist:', err);
            this.notification.showError('Failed to add to wishlist');
          }
        });
      }
    });
  }

  buyNow(): void {
    this.notification.showSuccess(`Proceeding to buy ${this.quantity} item(s) of ${this.product?.name}!`);
  }

  goBack(): void {
    this.location.back();
  }

  private loadRelatedProducts(): void {
    if (!this.product?.id) return;

    this.productService.getRelatedProducts(this.product.id.toString()).subscribe({
      next: (products) => {
        this.relatedProducts = products.filter(p => p.id.toString() !== this.product?.id.toString()).slice(0, 4);
      },
      error: (err) => {
        console.error('Failed to load related products:', err);
      }
    });
  }
}