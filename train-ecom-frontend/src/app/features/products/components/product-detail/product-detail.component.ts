import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private notification = inject(NotificationService);

  product: Product | null = null;
  selectedImageUrl: string = '';
  quantity: number = 1;
  isLoading: boolean = true;
  relatedProducts: Product[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
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

  addToCart(): void {
    this.notification.showSuccess(`Added ${this.quantity} item(s) of ${this.product?.name} to cart!`);
  }

  addToWishlist(): void {
    this.notification.showSuccess(`Added ${this.product?.name} to Wishlist!`);
  }

  buyNow(): void {
    this.notification.showSuccess(`Proceeding to buy ${this.quantity} item(s) of ${this.product?.name}!`);
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