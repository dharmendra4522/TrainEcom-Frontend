import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts, selectProductsLoading, selectProductTotalRecords } from '../../../../core/store/product/product.selectors';
import { FormControl } from '@angular/forms';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { combineLatest, Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, startWith, take } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);

  private destroy$ = new Subject<void>();

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);
  totalRecords$: Observable<number> = this.store.select(selectProductTotalRecords);

  ProductList: Product[] = [];

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  brandControl = new FormControl('');

  brands$ = this.store.select(selectAllBrands);
  categories$ = this.store.select(selectAllCategories);

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
    { actionKey: 'delete', icon: 'delete', color: 'warn', tooltip: 'Delete Product' },
    { actionKey: 'edit', icon: 'edit', color: 'primary', tooltip: 'Edit Product' }
  ];


  isAdminRoute: boolean = false;

  ngOnInit() {
    this.isAdminRoute = this.router.url.includes('/admin');
    
    this.store.select(selectAllBrands).pipe(take(1)).subscribe(brands => {
      if (!brands || brands.length === 0) {
        this.store.dispatch(BrandActions.loadBrands());
      }
    });

    this.store.select(selectAllCategories).pipe(take(1)).subscribe(categories => {
      if (!categories || categories.length === 0) {
        this.store.dispatch(CategoryActions.loadCategories());
      }
    });

    this.fetchProducts();
    this.setupSearchFilter();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchFilter(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged()
      ),
      this.categoryControl.valueChanges.pipe(startWith('')),
      this.brandControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      takeUntil(this.destroy$)).subscribe(([search, category, brand]) => {
        this.pageNumber = 1; // Reset to first page on filter change
        this.store.dispatch(ProductActions.loadProducts({
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          search: search || undefined,
          categoryName: category || undefined,
          brandName: brand || undefined
        }));

      });
  }

  onRowClick(product: Product): void {
    this.router.navigate(['/admin/products/view', product.id]);
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.brandControl.setValue('');
  }

 fetchProducts() {
    this.store.dispatch(ProductActions.loadProducts({
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchControl.value || undefined,
      categoryName: this.categoryControl.value || undefined,
      brandName: this.brandControl.value || undefined
    }));
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
    this.store.dispatch(ProductActions.deleteProduct({ productId }));
  }
}
