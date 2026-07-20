import { Component, inject } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

  private productService = inject(ProductService);
  private notification = inject(NotificationService);

  ProductList: Product[] = [];


  displayedColumns: string[] = ['id', 'name', 'description', 'price', 'stock', 'categoryName', 'brandName', 'thumbnailUrl', 'actions'];
  dataSource!: Product[];

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.dataSource = products;
        this.notification.showSuccess('Products fetched successfully', 'Close');
        console.log('Fetched products:', products);
      },
      error: (error: unknown) => {
        console.error('Error fetching products:', error);
        this.notification.showError('Error fetching products', 'Close');
      }
    });
  }

  deleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.notification.showSuccess('Product deleted successfully', 'Close');
        this.fetchProducts();
      }
    })
  }


}
