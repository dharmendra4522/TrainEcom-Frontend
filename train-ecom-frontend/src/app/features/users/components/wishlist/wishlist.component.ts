import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { WishListItem } from '../../../../core/models/wishList.model';
import { ProductService } from '../../../../core/services/product.service';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../../../core/services/notification.service';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import * as WishlistActions from '../../../../core/store/wish-list/wishList.actions';
import { selectWishlistItems } from '../../../../core/store/wish-list/wishList.selectors';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private notificationService = inject(NotificationService);

  wishlist$!: Observable<Product[]>;
  justForYouItems: Product[] = [];

  ngOnInit(): void {
    this.initWishlist();
    this.loadRecommendations();
  }
  private initWishlist(): void {
    this.wishlist$ = this.store.select(selectWishlistItems).pipe(
      map((items: WishListItem[]) => this.mapWishlistToProducts(items))
    );
    this.store.dispatch(WishlistActions.loadWishlist());
  }

  private loadRecommendations(): void {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.justForYouItems = (products || []).slice(0, 4);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Failed to load recommendations:', err);
        this.notificationService.showError('Could not load recommendations', 'Close');
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
    this.store.dispatch(WishlistActions.removeFromWishlist({ productId: item.id.toString() }));
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