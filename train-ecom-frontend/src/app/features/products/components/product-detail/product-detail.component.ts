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
      } else {
        this.loadMockProduct();
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
        console.warn('Backend unavailable or product not found, loading fallback product UI:', err);
        this.loadMockProduct(id);
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
    } else {
      this.selectedImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop';
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
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.relatedProducts = products.filter(p => p.id.toString() !== this.product?.id.toString()).slice(0, 4);
        if (this.relatedProducts.length === 0) {
          this.relatedProducts = this.getMockRelatedProducts();
        }
      },
      error: () => {
        this.relatedProducts = this.getMockRelatedProducts();
      }
    });
  }

  private loadMockProduct(id: string = '1'): void {
    const mockImages = [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', isPrimary: true },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop', isPrimary: false },
      { id: '4', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop', isPrimary: false }
    ];

    this.product = {
      id: id,
      name: 'Wireless Noise Cancelling Headphones Pro',
      description: 'Experience premium high-fidelity audio with active noise cancellation, 30-hour battery life, and ergonomic memory foam ear cushions for all-day comfort.',
      price: 299.99,
      brandName: 'AudioTech',
      categoryName: 'Electronics',
      stockQuantity: 12,
      thumbnailUrl: mockImages[0].imageUrl,
      images: mockImages
    };

    this.selectedImageUrl = mockImages[0].imageUrl;
    this.relatedProducts = this.getMockRelatedProducts();
  }

  private getMockRelatedProducts(): Product[] {
    return [
      {
        id: '101',
        name: 'Smart Bluetooth Speaker',
        description: 'Immersive 360-degree sound with deep bass.',
        price: 129.99,
        brandName: 'AudioTech',
        categoryName: 'Electronics',
        stockQuantity: 8,
        thumbnailUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=500&auto=format&fit=crop',
        images: []
      },
      {
        id: '102',
        name: 'Pro Wireless Earbuds',
        description: 'Ultra-compact earbuds with charging case.',
        price: 179.99,
        brandName: 'AudioTech',
        categoryName: 'Electronics',
        stockQuantity: 15,
        thumbnailUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=500&auto=format&fit=crop',
        images: []
      },
      {
        id: '103',
        name: 'Over-Ear Studio Monitor',
        description: 'Professional grade audio monitoring headphones.',
        price: 249.99,
        brandName: 'SoundMaster',
        categoryName: 'Electronics',
        stockQuantity: 5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=500&auto=format&fit=crop',
        images: []
      },
      {
        id: '104',
        name: 'Portable Mini Boombox',
        description: 'Waterproof outdoor speaker with LED lights.',
        price: 89.99,
        brandName: 'AudioTech',
        categoryName: 'Electronics',
        stockQuantity: 20,
        thumbnailUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=500&auto=format&fit=crop',
        images: []
      }
    ];
  }
}
