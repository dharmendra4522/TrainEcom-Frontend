import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
  DropdownOptions,
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
import { combineLatest, Subject, Observable, EMPTY, timer } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  startWith,
  take,
  switchMap,
  map,
  catchError,
  finalize,
} from 'rxjs/operators';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { extractBackendMessage } from '../../../../core/utils/error.utils';
import { Category } from '../../../../core/models/category.model';
import { Brand } from '../../../../core/models/brand.model';

interface DropdownOptionsRequest {
  columnKey: string;
  searchTerm: string;
  pageNumber: number;
  append: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private productService = inject(ProductService);
  private notification = inject(NotificationService);
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
  pageSize: number = 15;
  totalRecords: number = 0;
  hasMoreData: boolean = true;
  portal: PortalKey = 'admin';
  isLoadingValue: boolean = false;
  showHeaderFilter: boolean = true;

  // state map for filter column dropdown
  dropdownOptionsMap: Record<string, DropdownOptions[]> = {};
  dropdownLoadingMap: Record<string, boolean> = {};
  selectedFiltersMap: Record<string, (string | number)[]> = {};
  private dropdownPageMap: Record<string, number> = {};
  private dropdownHasMoreMap: Record<string, boolean> = {};
  private dropdownSearchTermMap: Record<string, string> = {};
  private readonly dropdownOptionsPageSize = 10;

  private readonly columnSearchSubject$ = new Subject<DropdownOptionsRequest>();

  // track column filter
  columnFilters: Record<string, string> = {};
  private readonly columnTableSearchSubject$ = new Subject<
    Record<string, string>
  >();

  columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      filterable: true,
      filterType: 'search',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'string',
      sortable: false,
      filterable: true,
      filterType: 'search',
      filterDisabled: true,
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      filterable: true,
      filterType: 'price-range',
    },
    {
      key: 'stockQuantity',
      label: 'Stock',
      type: 'number',
      filterable: true,
      filterType: 'stock-range',
    },
    {
      key: 'categoryName',
      label: 'Category',
      type: 'string',
      filterable: true,
      filterType: 'dropdown',
    },
    {
      key: 'brandName',
      label: 'Brand',
      type: 'string',
      filterable: true,
      filterType: 'dropdown',
    },
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

  ngOnInit(): void {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';
    const initialCategory =
      this.route.snapshot.queryParamMap.get('categoryName');
    if (initialCategory) {
      this.categoryControl.setValue(initialCategory, { emitEvent: false });
    }

    this.loadInitialMetadata();
    this.initSubscriptions();
    this.setupSearchFilter();
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const categoryName = params.get('categoryName') ?? '';
        if (this.categoryControl.value !== categoryName) {
          this.categoryControl.setValue(categoryName);
        }
      });
    this.setupColumnDropdownSearch();
  }

  private setupColumnDropdownSearch(): void {
    this.columnSearchSubject$
      .pipe(
        switchMap((request) => {
          this.dropdownLoadingMap[request.columnKey] = true;
          return timer(request.append ? 0 : 300).pipe(
            switchMap(() =>
              this.productService.getPaginatedProducts(
                request.pageNumber,
                this.dropdownOptionsPageSize,
                this.brandControl.value || undefined,
                this.categoryControl.value || undefined,
                request.searchTerm || undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.portal,
              ),
            ),
            map((response) => ({ request, response })),
            catchError((error: unknown) => {
              this.notification.showError(
                extractBackendMessage(error, 'Failed to load filter options'),
              );
              return EMPTY;
            }),
            finalize(() => {
              this.dropdownLoadingMap[request.columnKey] = false;
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ request, response }) => {
        const existingOptions = request.append
          ? this.dropdownOptionsMap[request.columnKey] || []
          : [];
        const optionKeys = new Set(
          existingOptions.map((option) => `${typeof option.id}:${option.id}`),
        );
        const options = [...existingOptions];

        response.items.forEach((product) => {
          const value = product[request.columnKey];
          if (
            (typeof value === 'string' && value.trim() !== '') ||
            (typeof value === 'number' && Number.isFinite(value))
          ) {
            const optionKey = `${typeof value}:${value}`;
            if (!optionKeys.has(optionKey)) {
              optionKeys.add(optionKey);
              options.push({ id: value, label: String(value) });
            }
          }
        });

        this.dropdownOptionsMap[request.columnKey] = options;
        this.dropdownPageMap[request.columnKey] = request.pageNumber;
        const totalPages =
          response.totalPages ||
          Math.ceil(response.totalRecords / this.dropdownOptionsPageSize);
        this.dropdownHasMoreMap[request.columnKey] =
          request.pageNumber < totalPages;
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

  onDropdownSearchTriggered(event: {
    columnKey: string;
    searchTerm: string;
  }): void {
    const colKey = event.columnKey;
    const term = event.searchTerm.trim().toLowerCase();

    if (colKey === 'categoryName') {
      this.categories$.pipe(take(1)).subscribe((categories) => {
        const filtered = categories.filter((cat: Category) =>
          cat.name.toLowerCase().includes(term),
        );
        this.dropdownOptionsMap[colKey] = filtered.map((cat: Category) => ({
          id: cat.id,
          label: cat.name,
        }));
      });
      return;
    }

    if (colKey === 'brandName') {
      this.brands$.pipe(take(1)).subscribe((brands) => {
        const filtered = brands.filter((brand: Brand) =>
          brand.name.toLowerCase().includes(term),
        );
        this.dropdownOptionsMap[colKey] = filtered.map((brand: Brand) => ({
          id: brand.id,
          label: brand.name,
        }));
      });
      return;
    }

    this.dropdownSearchTermMap[event.columnKey] = event.searchTerm.trim();
    this.dropdownOptionsMap[event.columnKey] = [];
    this.dropdownPageMap[event.columnKey] = 0;
    this.dropdownHasMoreMap[event.columnKey] = true;
    this.loadDropdownOptionsForColumn(
      event.columnKey,
      this.dropdownSearchTermMap[event.columnKey],
      1,
      false,
    );
  }

  onDropdownOpened(columnKey: string): void {
    if (columnKey === 'categoryName') {
      this.categories$.pipe(take(1)).subscribe((categories) => {
        this.dropdownOptionsMap[columnKey] = categories.map((cat: Category) => ({
          id: cat.id,
          label: cat.name,
        }));
      });
      return;
    }

    if (columnKey === 'brandName') {
      this.brands$.pipe(take(1)).subscribe((brands) => {
        this.dropdownOptionsMap[columnKey] = brands.map((brand: Brand) => ({
          id: brand.id,
          label: brand.name,
        }));
      });
      return;
    }
    this.dropdownSearchTermMap[columnKey] = '';
    this.dropdownOptionsMap[columnKey] = [];
    this.dropdownPageMap[columnKey] = 0;
    this.dropdownHasMoreMap[columnKey] = true;
    this.loadDropdownOptionsForColumn(columnKey, '', 1, false);
  }

  onDropdownScrolled(columnKey: string): void {
    if (
      this.dropdownLoadingMap[columnKey] ||
      !this.dropdownHasMoreMap[columnKey]
    ) {
      return;
    }

    this.loadDropdownOptionsForColumn(
      columnKey,
      this.dropdownSearchTermMap[columnKey] || '',
      (this.dropdownPageMap[columnKey] || 0) + 1,
      true,
    );
  }

  private loadDropdownOptionsForColumn(
    columnKey: string,
    searchTerm: string,
    pageNumber: number,
    append: boolean,
  ): void {
    this.columnSearchSubject$.next({
      columnKey,
      searchTerm,
      pageNumber,
      append,
    });
  }

  // handle Apply
  onFilterApply(event: { columnKey: string }): void {
    try {
      this.pageNumber = 1;
      const categoryFilters =
        this.selectedFiltersMap?.['categoryName'] ?? [];
      const brandFilters =
        this.selectedFiltersMap?.['brandName'] ?? [];
      this.store.dispatch(
        ProductActions.loadProducts({
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          search: this.searchControl.value?.trim() || undefined,
          categoryName:
            categoryFilters.length > 0
              ? String(categoryFilters[0])
              : this.categoryControl.value || undefined,
          brandName:
            brandFilters.length > 0
              ? String(brandFilters[0])
              : this.brandControl.value || undefined,
          portal: this.portal,
        }),
      );
    } catch (error) {
      this.notification.showError(
        'Something went wrong while applying filters.',
      );
      console.error(error);
    }
  }

  // handle drop-down clear
  onFilterClear(columnKey: string): void {
    if (this.selectedFiltersMap[columnKey]) {
      delete this.selectedFiltersMap[columnKey];
    }
    this.fetchFilteredProducts();
  }

  private fetchFilteredProducts(): void {
    this.store.dispatch(
      ProductActions.loadProducts({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        search: this.searchControl.value?.trim() || undefined,
        categoryName: this.categoryControl.value || undefined,
        brandName: this.brandControl.value || undefined,
        portal: this.portal,
      }),
    );
  }

  // Isse dropdown item click hone par selected state update hogi
  onDropdownSelectionChanged(event: {
    columnKey: string;
    option: DropdownOptions;
  }): void {
    const colKey = event.columnKey;
    const optId = event.option.id;
    const currentSelected = this.selectedFiltersMap[colKey]
      ? [...this.selectedFiltersMap[colKey]]
      : [];
    const index = currentSelected.indexOf(optId);
    if (index > -1) {
      currentSelected.splice(index, 1);
    } else {
      currentSelected.push(optId);
    }
    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      [colKey]: currentSelected,
    };
  }

  onTableFilterChanged(filters: Record<string, string>): void {
    this.columnFilters = filters;
    const firstSearchVal =
      Object.values(filters)
        .find((v) => v !== undefined && v !== null)
        ?.trim() || '';
    if (this.searchControl.value !== firstSearchVal) {
      this.searchControl.setValue(firstSearchVal, { emitEvent: true });
    }
  }

  onTableFilterCleared(columnKey: string): void {
    if (
      columnKey === 'name' ||
      columnKey === 'price' ||
      columnKey === 'stockQuantity'
    ) {
      this.searchControl.setValue('', { emitEvent: true });
    }
    this.columnFilters = {};
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
