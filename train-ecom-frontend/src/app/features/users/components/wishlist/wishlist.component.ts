import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { WishListService } from '../../../../core/services/wish-list.service';
import { WishListItem } from '../../../../core/models/wishList.model';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  private wishListService = inject(WishListService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  wishlist: Product[] = [];
  justForYouItems: Product[] = [];

  ngOnInit(): void {
    this.wishListService.wishlistItems$.subscribe({
      next: (items: WishListItem[]) => {
        this.wishlist = this.mapWishlistToProducts(items);
        this.cdr.detectChanges();
      }
    });
    this.wishListService.loadWishlist();

    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.justForYouItems = (products || []).slice(0, 4);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Failed to load recommendations:', err);
      }
    });
  }

  private mapWishlistToProducts(items: WishListItem[]): Product[] {
    return (items || []).map(item => ({
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
          isPrimary: true
        }
      ]
    }));
  }

  removeFromWishlist(item: Product): void {
    this.wishListService.removeFromWishlist(item.id.toString()).subscribe();
  }

  addToCart(item: Product): void {
    console.log('Adding to cart:', item);
  }

  moveAllToBag(): void {
    console.log('Moving all wishlist items to bag');
  }

  seeAllRecommendations(): void {
    console.log('See all recommendations clicked');
  }
}