import { Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { Router } from '@angular/router';
import { BrandService } from '../../../../core/services/brand.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { MatSort, Sort } from '@angular/material/sort';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private productService = inject(ProductService);
  private router = inject(Router);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private confirnDialog = inject(ConfirmDialogServiceService);

  dataSource = new MatTableDataSource<Product>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayColumns: string[] = [
    'index',
    'name',
    'description',
    'brandName',
    'categoryName',
    'price',
    'stockQuantity',
    'thumbnailUrl',
    'action',
  ];

  brandData: Brand[] = [];
  categoryData: Category[] = [];
  // Pagination Varialbes
  totalElement: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  // for filter based of brand and category
  selectedBrand: string = '';
  selectedCategory: string = '';
  searchControl = new FormControl('');
  searchTearm: string = '';

  isLoading: boolean = false;

  ngOnInit() {
    this.loadProduct(this.pageIndex, this.pageSize);
    this.loadBrand();
    this.loadCategory();
    this.loadProductOnSearch();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  private loadProduct(page: number, size: number): void {
    this.isLoading = true;
    const apiPageNumber = page + 1;
    this.productService
      .getPaginatedProducts(
        apiPageNumber,
        size,
        this.selectedBrand,
        this.selectedCategory,
        this.searchTearm,
      )
      .subscribe({
        next: (response) => {
          const productData: Product[] = response.items || [];
          this.totalElement = response.totalRecords || 0;
          this.dataSource.data = productData.map((product) => ({
            ...product,
            description: this.transform(product.description),
          }));
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.notificationService.showError(
            'Somting is Wrong to load product from server',
          );
          console.log('Error:', err);
        },
      });
  }

  private loadProductOnSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((search) => {
          this.searchTearm = search || '';
          this.pageIndex = 0;
          this.isLoading = true;

          return this.productService.getPaginatedProducts(
            this.pageIndex + 1,
            this.pageSize,
            this.selectedBrand,
            this.selectedCategory,
            this.searchTearm,
          );
        }),
      )
      .subscribe({
        next: (response) => {
          const productData: Product[] = response.items || [];
          this.totalElement = response.totalRecords || 0;
          this.dataSource.data = productData.map((product) => ({
            ...product,
            description: this.transform(product.description),
          }));
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.log('Error fetching search product', err);
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProduct(this.pageIndex, this.pageSize);
  }

  onBrandChange(brand: string): void {
    this.selectedBrand = brand;
    this.pageIndex = 0;
    this.loadProduct(this.pageIndex, this.pageSize);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.pageIndex = 0;
    this.loadProduct(this.pageIndex, this.pageSize);
  }

  private loadBrand(): void {
    this.brandService.getAllBrands().subscribe({
      next: (response) => {
        this.brandData = response;
      },
      error(err) {
        console.log('Error to fetch brands', err);
      },
    });
  }

  private loadCategory(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categoryData = response;
      },
      error(err) {
        console.log('Error to fetch category', err);
      },
    });
  }

  private transform(description: string): string {
    if (!description) return '';
    return description.substring(0, 10) + '...';
  }

  onEdit(id: string): void {
    this.router.navigate(['/admin/products/edit', id]);
  }

  onDelete(id: string): void {
    if (!id) return;
    this.confirnDialog
      .confirm(
        'Are you sure you want to delete this product?',
        'Yes, Delete',
        'Cancel',
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.productService.deleteProduct(id).subscribe({
            next: (res) => {
              this.notificationService.showSuccess(
                'Product deleted successfully!',
              );
              this.dataSource.data = this.dataSource.data.filter(
                (product) => product.id != id,
              );
              this.loadProduct(this.pageIndex, this.pageSize);
            },
            error: (err) => {
              this.notificationService.showError('Failed to delete product!');
              console.log('Error:', err);
            },
          });
        }
      });
  }

  onProductDetail(id: string): void {
    this.router.navigate(['/admin/products/view', id]);
  }

  clearAllFilter(): void {
    this.searchControl.setValue('', { emitEvent: true });
    this.selectedBrand = '';
    this.selectedCategory = '';
    this.pageIndex = 0;
    this.loadProduct(this.pageIndex, this.pageSize);
  }
}
