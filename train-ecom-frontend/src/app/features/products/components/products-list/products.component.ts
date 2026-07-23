import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts, selectProductsLoading, selectProductTotalRecords } from '../../../../core/store/product/product.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private store = inject(Store);

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);
  totalRecords$: Observable<number> = this.store.select(selectProductTotalRecords);

  ProductList: Product[] = [];

  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

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

  isAdminRoute: boolean = false;

  ngOnInit() {
    this.isAdminRoute = this.router.url.includes('/admin');
    this.fetchProducts();
  }

  fetchProducts() {
    this.store.dispatch(ProductActions.loadProducts({ pageNumber: this.pageNumber, pageSize: this.pageSize }));
  }

  onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchProducts();
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
        this.store.dispatch(ProductActions.loadProducts({ pageNumber: this.pageNumber, pageSize: this.pageSize }));
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.notification.showError('Error deleting product', 'Close');
      }
    });
  }
}
