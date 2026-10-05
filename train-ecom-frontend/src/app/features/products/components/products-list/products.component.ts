import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
} from '../../../../core/models/table.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import {
  selectAllProducts,
  selectProductsLoading,
  selectProductTotalRecords,
} from '../../../../core/store/product/product.selectors';
import { FormControl } from '@angular/forms';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { combineLatest, Subject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  startWith,
  take,
} from 'rxjs/operators';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private confirmDialog = inject(ConfirmDialogServiceService);
  readonly portalRoutes = inject(PortalRouteService);
  private route = inject(ActivatedRoute);

  // Destroy Subject
  private readonly destroy$ = new Subject<void>();

  // selectors
  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);
  totalRecords$: Observable<number> = this.store.select(
    selectProductTotalRecords,
  );
  brands$ = this.store.select(selectAllBrands);
  categories$ = this.store.select(selectAllCategories);

  // form control
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  brandControl = new FormControl('');

  // component state
  ProductList: Product[] = [];
  currentPage: number = 1;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  hasMoreData: boolean = true;
  portal: PortalKey = 'admin';
  isLoadingValue: boolean = false;

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'string' },
    {
      key: 'description',
      label: 'Description',
      type: 'string',
      sortable: false,
    },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'stockQuantity', label: 'Stock', type: 'number' },
    { key: 'categoryName', label: 'Category', type: 'string' },
    { key: 'brandName', label: 'Brand', type: 'string' },
    {
      key: 'thumbnailUrl',
      label: 'Product Image',
      type: 'image',
      sortable: false,
    },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete Product',
    },
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      tooltip: 'Edit Product',
    },
  ];

  ngOnInit() {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';
    const initialCategory = this.route.snapshot.queryParamMap.get('categoryName');
    if (initialCategory) {
      this.categoryControl.setValue(initialCategory, { emitEvent: false });
    }

    this.loadInitialMetadata();
    this.initSubscriptions();
    this.setupSearchFilter();
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const categoryName = params.get('categoryName') ?? '';
      if (this.categoryControl.value !== categoryName) {
        this.categoryControl.setValue(categoryName);
      }
    });
  }

  // load initial data Brands aur Categories
  private loadInitialMetadata(): void {
    this.store
      .select(selectAllBrands)
      .pipe(take(1))
      .subscribe((brands) => {
        if (!brands || brands.length === 0) {
          this.store.dispatch(BrandActions.loadBrands());
        }
      });

    this.store
      .select(selectAllCategories)
      .pipe(take(1))
      .subscribe((categories) => {
        if (!categories || categories.length === 0) {
          this.store.dispatch(CategoryActions.loadCategories());
        }
      });
  }

  // initalize store state subscription
  private initSubscriptions(): void {
    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isLoadingValue = loading;
    });

    this.products$.pipe(takeUntil(this.destroy$)).subscribe((products) => {
      if (this.pageNumber === 1) {
        this.ProductList = [...products];
      } else {
        const existingIds = new Set(this.ProductList.map((p) => p.id));
        const newProduct = products.filter((p) => !existingIds.has(p.id));
        this.ProductList = [...this.ProductList, ...newProduct];
      }
      this.checkPaginationLimit();
    });
    this.totalRecords$.pipe(takeUntil(this.destroy$)).subscribe((total) => {
      this.totalRecords = total;
      this.checkPaginationLimit();
    });
  }

  // setupSearchFilter method to handle search, category, and brand filtering
  setupSearchFilter(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
      ),
      this.categoryControl.valueChanges.pipe(
        startWith(this.categoryControl.value),
        distinctUntilChanged(),
      ),
      this.brandControl.valueChanges.pipe(startWith('')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([search, category, brand]) => {
        this.pageNumber = 1; // Reset to first page on filter change
        this.store.dispatch(
          ProductActions.loadProducts({
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            search: search?.trim() || undefined,
            categoryName: category || undefined,
            brandName: brand || undefined,
            portal: this.portal,
          }),
        );
      });
  }

  // dispatch fatehc sction to store
  private fetchProducts(
    search?: string,
    categoryName?: string,
    brandName?: string,
  ): void {
    this.store.dispatch(
      ProductActions.loadProducts({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        search,
        categoryName,
        brandName,
        portal: this.portal,
      }),
    );
  }

  // check if more recode exist for load
  private checkPaginationLimit(): void {
    if (this.totalRecords > 0 && this.ProductList.length >= this.totalRecords) {
      this.hasMoreData = false;
    } else {
      this.hasMoreData = true;
    }
  }

  // handle scrolling on table
  onScrollLoad(): void {
    if (this.isLoadingValue || !this.hasMoreData) return;
    this.pageNumber++;
    this.fetchProducts(
      this.searchControl.value?.trim() || undefined,
      this.categoryControl.value || undefined,
      this.brandControl.value || undefined,
    );
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.categoryControl.setValue('', { emitEvent: false });
    this.brandControl.setValue('', { emitEvent: false });
    this.pageNumber = 1;
    this.fetchProducts();
  }

  onRowClick(row: Record<string, unknown>): void {
    const product = row as Product;
    this.router.navigate(
      this.portalRoutes.products(this.portal, 'view', product.id),
    );
  }

  handleTableAction(event: TableActionEvent): void {
    const product = event.row as Product;
    if (event.action === 'edit') {
      this.router.navigate(
        this.portalRoutes.products(this.portal, 'edit', product.id),
      );
    } else if (event.action === 'delete') {
      this.deleteProduct(product.id.toString());
    } else if (event.action === 'view') {
      this.router.navigate(
        this.portalRoutes.products(this.portal, 'view', product.id),
      );
    }
  }

  // delete product
  private deleteProduct(productId: string) {
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this product?',
        'Delete',
        'Cancel',
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(
            ProductActions.deleteProduct({ productId, portal: this.portal }),
          );
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
