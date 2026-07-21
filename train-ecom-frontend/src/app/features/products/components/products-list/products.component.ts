import { Component, inject } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Router } from '@angular/router';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

  private productService = inject(ProductService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  ProductList: Product[] = [];
  
  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'price', label: 'Price' },
    { key: 'stockQuantity', label: 'Stock' },
    { key: 'categoryName', label: 'Category' },
    { key: 'brandName', label: 'Brand' },
    { key: 'thumbnailUrl', label: 'Thumbnail', type: 'image' }
  ];

  actions: TableAction[] = [
    { actionKey: 'edit', icon: 'edit', color: 'primary', tooltip: 'Edit Product' },
    { actionKey: 'delete', icon: 'delete', color: 'warn', tooltip: 'Delete Product' }
  ];


  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.ProductList = products;
        this.notification.showSuccess('Products fetched successfully', 'Close');
        console.log('Fetched products:', products);
      },
      error: (error: unknown) => {
        console.error('Error fetching products:', error);
        this.notification.showError('Error fetching products', 'Close');
      }
    });
  }

   handleTableAction(event: TableActionEvent<Product>): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/products/edit', event.row.id]);
    } else if (event.action === 'delete') {
      this.deleteProduct(event.row.id.toString());
    }
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
