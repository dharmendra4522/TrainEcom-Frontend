import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  Product,
  PaginatedProductsResponse,
  ProductListField
} from '../../../../core/models/product.model';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
  DropdownOptions
} from '../../../../core/models/table.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import {
  selectAllProducts,
  selectProductsLoading,
  selectProductRangeBounds,
  selectProductTotalRecords
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
  finalize
} from 'rxjs/operators';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { ProductService } from '../../../../core/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { extractBackendMessage } from '../../../../core/utils/error.utils';
import { Category } from '../../../../core/models/category.model';
import { Brand } from '../../../../core/models/brand.model';
import { Range } from '../../../../shared/components/multiselect-dropdown/multiselect-dropdown.component';

interface DropdownOptionsRequest {
  columnKey: string;
  searchTerm: string;
  pageNumber: number;
  append: boolean;
  requestField?: ProductListField;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
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
    selectProductTotalRecords
  );
  rangeBounds$ = this.store.select(selectProductRangeBounds);
  brands$ = this.store.select(selectAllBrands);
  categories$ = this.store.select(selectAllCategories);

  // form control
  searchControl = new FormControl('');
  categoryControl = new FormControl<number | null>(null);
  brandControl = new FormControl<number | null>(null);

  // component state
  ProductList: Product[] = [];
  pageNumber: number = 1;
  pageSize: number = 15;
  totalRecords: number = 0;
  hasMoreData: boolean = true;
  portal: PortalKey = 'admin';
  isLoadingValue: boolean = false;
  showHeaderFilter: boolean = true;
  filterResetToken = 0;
  private activeColumnSearchKey: 'name' | 'description' | null = null;
  rangeBoundsMap: Record<string, Range> = {
    price: { min: 0, max: 0 },
    stockQuantity: { min: 0, max: 0 }
  };
  selectedRangesMap: Record<string, Range> = {};

  // state map for filter column dropdown
  dropdownOptionsMap: Record<string, DropdownOptions[]> = {};
  dropdownLoadingMap: Record<string, boolean> = {};
  selectedFiltersMap: Record<string, (string | number)[]> = {};
  private dropdownPageMap: Record<string, number> = {};
  private dropdownHasMoreMap: Record<string, boolean> = {};
  private dropdownSearchTermMap: Record<string, string> = {};
  private readonly dropdownOptionsPageSize = 10;
  private readonly rangeRequestFields: Record<
    'price' | 'stockQuantity',
    ProductListField
  > = {
      price: ProductListField.Price,
      stockQuantity: ProductListField.StockQuantity
    };
  private readonly loadedRangeColumns = new Set<
    'price' | 'stockQuantity'
  >();

  private readonly columnSearchSubject$ = new Subject<DropdownOptionsRequest>();

  // track column filter
  columnFilters: Record<string, string> = {};
  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      filterable: true,
      filterType: 'search',
      clickable: true
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      filterable: true,
      filterType: 'search'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'string',
      sortable: false,
      filterable: true,
      filterType: 'search',
      filterDisabled: true
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      filterable: true,
      filterType: 'price-range'
    },
    {
      key: 'stockQuantity',
      label: 'Stock',
      type: 'number',
      filterable: true,
      filterType: 'stock-range'
    },
    {
      key: 'categoryName',
      label: 'Category',
      type: 'string',
      filterable: true,
      filterType: 'dropdown'
    },
    {
      key: 'brandName',
      label: 'Brand',
      type: 'string',
      filterable: true,
      filterType: 'dropdown'
    },
    {
      key: 'thumbnailUrl',
      label: 'Product Image',
      type: 'image',
      sortable: false
    },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete'
    },
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      tooltip: 'Edit'
    }
  ];

  ngOnInit(): void {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';
    const initialCategory =
      this.route.snapshot.queryParamMap.get('category');
    const initialCategoryId = this.parseCategoryId(initialCategory);
    if (initialCategoryId !== null) {
      this.categoryControl.setValue(initialCategoryId, { emitEvent: false });
    }

    this.loadInitialMetadata();
    this.initSubscriptions();
    this.setupSearchFilter();
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const categoryId = this.parseCategoryId(params.get('category'));
        if (this.categoryControl.value !== categoryId) {
          this.categoryControl.setValue(categoryId);
        }
      });
    this.setupColumnDropdownSearch();
  }

  private setupColumnDropdownSearch(): void {
    this.columnSearchSubject$
      .pipe(
        switchMap((request) =>
          this.loadDropdownRequest(request)
        ),
        takeUntil(this.destroy$),
      )
      .subscribe(({ request, response }) => {
        this.updateDropdownOptions(request, response);
        this.updateRangeBoundsFromResponse(request, response);
      });
  }

  // load data according to filtered column
  private loadDropdownRequest(
    request: DropdownOptionsRequest
  ): Observable<{
    request: DropdownOptionsRequest;
    response: PaginatedProductsResponse;
  }> {
    this.dropdownLoadingMap[request.columnKey] = true;

    return timer(request.append ? 0 : 300).pipe(
      switchMap(() =>
        this.productService.getPaginatedProducts({
          pageNumber: request.pageNumber,
          pageSize: this.dropdownOptionsPageSize,
          search: request.requestField
            ? undefined
            : request.searchTerm || undefined,
          requestField: request.requestField,
          portal: this.portal
        })
      ),
      map((response) => ({
        request,
        response
      })),
      catchError((error: unknown) => {
        this.notification.showError(
          extractBackendMessage(
            error,
            'Failed to load filter options'
          )
        );

        return EMPTY;
      }),
      finalize(() => {
        this.dropdownLoadingMap[request.columnKey] = false;
      })
    );
  }

  // handle dropdown options update after response
  private updateDropdownOptions(
    request: DropdownOptionsRequest,
    response: PaginatedProductsResponse
  ): void {
    const existingOptions = request.append
      ? this.dropdownOptionsMap[request.columnKey] || []
      : [];

    const optionKeys = new Set(
      existingOptions.map(
        (option) => `${typeof option.id}:${option.id}`
      )
    );

    const options = [...existingOptions];

    response.items.forEach((product) => {
      const value = product[request.columnKey];

      if (
        (typeof value === 'string' &&
          value.trim() !== '') ||
        (typeof value === 'number' &&
          Number.isFinite(value))
      ) {
        const optionKey =
          `${typeof value}:${value}`;

        if (!optionKeys.has(optionKey)) {
          optionKeys.add(optionKey);

          options.push({
            id: value,
            label: String(value)
          });
        }
      }
    });

    this.dropdownOptionsMap[request.columnKey] =
      options;

    this.dropdownPageMap[request.columnKey] =
      request.pageNumber;

    const totalPages =
      response.totalPages ||
      Math.ceil(
        response.totalRecords /
        this.dropdownOptionsPageSize
      );

    this.dropdownHasMoreMap[
      request.columnKey
    ] =
      request.pageNumber < totalPages;
  }


  private updateRangeBoundsFromResponse(
    request: DropdownOptionsRequest,
    response: PaginatedProductsResponse,
  ): void {
    if (request.requestField === ProductListField.Price) {
      this.rangeBoundsMap = {
        ...this.rangeBoundsMap,
        price: {
          min: response.minPrice,
          max: response.maxPrice
        }
      };
    } else if (request.requestField === ProductListField.StockQuantity) {
      this.rangeBoundsMap = {
        ...this.rangeBoundsMap,
        stockQuantity: {
          min: response.minStock,
          max: response.maxStock
        }
      };
    }
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
    this.subscribeToLoading();
    this.subscribeToProducts();
    this.subscribeToTotalRecords();
    this.subscribeToRangeBounds();
  }

  // subscribe to loading state changes
  private subscribeToLoading(): void {
    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isLoadingValue = loading;
    });
  }

  // handle product list subscription and update state
  private subscribeToProducts(): void {
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
  }

  // subscribe to total records changes
  private subscribeToTotalRecords(): void {
    this.totalRecords$.pipe(takeUntil(this.destroy$)).subscribe((total) => {
      this.totalRecords = total;
      this.checkPaginationLimit();
    });
  }

  // subscribe to range bounds changes
  private subscribeToRangeBounds(): void {
    this.rangeBounds$.pipe(takeUntil(this.destroy$)).subscribe((bounds) => {
      const priceBounds = { min: bounds.minPrice, max: bounds.maxPrice };
      const stockBounds = { min: bounds.minStock, max: bounds.maxStock };
      this.rangeBoundsMap = {
        price: priceBounds,
        stockQuantity: stockBounds
      };

      const selectedPrice = this.selectedRangesMap['price'];
      const selectedStock = this.selectedRangesMap['stockQuantity'];
      this.selectedRangesMap = {
        ...this.selectedRangesMap,
        ...(selectedPrice
          ? { price: this.clampRange(selectedPrice, priceBounds) }
          : {}),
        ...(selectedStock
          ? {
            stockQuantity: this.clampRange(selectedStock, stockBounds),
          }
          : {})
      };
    });
  }

  setupSearchFilter(): void {
    this.searchControl.valueChanges
      .pipe(
        map((search) => search?.trim() ?? ''),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.loadFirstPage());

    combineLatest([
      this.categoryControl.valueChanges.pipe(
        startWith(this.categoryControl.value),
        distinctUntilChanged()
      ),
      this.brandControl.valueChanges.pipe(
        startWith(this.brandControl.value),
        distinctUntilChanged()
      ),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadFirstPage());
  }

  private loadFirstPage(): void {
    this.pageNumber = 1;
    this.dispatchCurrentProductQuery();
  }

  private dispatchCurrentProductQuery(): void {
    const masterSearch = this.searchControl.value?.trim() || undefined;
    const columnSearch = this.getActiveColumnSearch();
    this.store.dispatch(
      ProductActions.loadProducts({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        search: masterSearch ?? columnSearch.search,
        searchField: masterSearch ? undefined : columnSearch.searchField,
        categoryIds: this.getSelectedIds(
          'categoryName',
          this.categoryControl.value
        ),
        brandIds: this.getSelectedIds('brandName', this.brandControl.value),
        minPrice: this.selectedRangesMap['price']?.min,
        maxPrice: this.selectedRangesMap['price']?.max,
        minStock: this.selectedRangesMap['stockQuantity']?.min,
        maxStock: this.selectedRangesMap['stockQuantity']?.max,
        portal: this.portal
      })
    );
  }

  private getActiveColumnSearch(): {
    search?: string;
    searchField?: ProductListField;
  } {
    const key = this.activeColumnSearchKey;
    const search = key ? this.columnFilters[key]?.trim() : undefined;
    if (!search) {
      return {};
    }

    return {
      search,
      searchField:
        key === 'name'
          ? ProductListField.Name
          : ProductListField.Description
    };
  }

  private getSelectedIds(
    columnKey: 'categoryName' | 'brandName',
    fallbackId: number | null
  ): number[] | undefined {
    if (Object.prototype.hasOwnProperty.call(this.selectedFiltersMap, columnKey)) {
      const selectedIds = this.selectedFiltersMap[columnKey].filter(
        (id): id is number => typeof id === 'number'
      );
      return selectedIds.length > 0 ? selectedIds : undefined;
    }

    return fallbackId !== null ? [fallbackId] : undefined;
  }

  private parseCategoryId(value: string | null): number | null {
    if (value === null || value.trim() === '') {
      return null;
    }

    const categoryId = Number(value);
    return Number.isSafeInteger(categoryId) && categoryId > 0
      ? categoryId
      : null;
  }

  private clampRange(range: Range, bounds: Range): Range {
    const min = Math.min(Math.max(range.min, bounds.min), bounds.max);
    const max = Math.min(Math.max(range.max, bounds.min), bounds.max);
    return min <= max ? { min, max } : { min, max: min };
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
    this.dispatchCurrentProductQuery();
  }

  clearFilters(): void {
    const hadMasterSearch = Boolean(this.searchControl.value?.trim());
    this.searchControl.setValue('', { emitEvent: hadMasterSearch });
    this.categoryControl.setValue(null, { emitEvent: false });
    this.brandControl.setValue(null, { emitEvent: false });
    this.selectedFiltersMap = {};
    this.columnFilters = {};
    this.activeColumnSearchKey = null;
    this.selectedRangesMap = {};
    this.filterResetToken++;
    this.pageNumber = 1;
    if (!hadMasterSearch) {
      this.dispatchCurrentProductQuery();
    }
  }

  onRowClick(row: Record<string, unknown>): void {
    if (typeof row['id'] !== 'number') {
      return;
    }
    this.router.navigate(
      this.portalRoutes.products(this.portal, 'view', row['id']),
    );
  }

  handleTableAction(event: TableActionEvent): void {
    if (!this.isProductRow(event.row)) {
      return;
    }
    const productId = event.row.id;
    if (event.action === 'edit') {
      this.router.navigate(
        this.portalRoutes.products(this.portal, 'edit', productId)
      );
    } else if (event.action === 'delete') {
      this.deleteProduct(productId);
    } else if (event.action === 'view') {
      this.router.navigate(
        this.portalRoutes.products(this.portal, 'view', productId)
      );
    }
  }

  private isProductRow(row: unknown): row is { id: number } {
    return (
      typeof row === 'object' &&
      row !== null &&
      'id' in row &&
      typeof row.id === 'number'
    );
  }

  // delete product
  private deleteProduct(productId: number): void {
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this product?',
        'Delete',
        'Cancel'
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(
            ProductActions.deleteProduct({ productId, portal: this.portal })
          );
        }
      });
  }


  // handle dropdown search event
  onDropdownSearchTriggered(event: {
    columnKey: string;
    searchTerm: string;
  }): void {
    const colKey = event.columnKey;
    const term = event.searchTerm.trim().toLowerCase();

    if (colKey === 'categoryName') {
      this.categories$.pipe(take(1)).subscribe((categories) => {
        const filtered = categories.filter((cat: Category) =>
          cat.name.toLowerCase().includes(term)
        );
        this.dropdownOptionsMap[colKey] = filtered.map((cat: Category) => ({
          id: cat.id,
          label: cat.name
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
          label: brand.name
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
      false
    );
  }

  // handle dropdown open event
  onDropdownOpened(columnKey: string): void {
    if (columnKey === 'categoryName') {
      this.categories$.pipe(take(1)).subscribe((categories) => {
        this.dropdownOptionsMap[columnKey] = categories.map(
          (cat: Category) => ({
            id: cat.id,
            label: cat.name
          })
        );
      });
      return;
    }

    if (columnKey === 'brandName') {
      this.brands$.pipe(take(1)).subscribe((brands) => {
        this.dropdownOptionsMap[columnKey] = brands.map((brand: Brand) => ({
          id: brand.id,
          label: brand.name
        }));
      });
      return;
    }

    if (this.isRangeColumn(columnKey)) {
      if (this.loadedRangeColumns.has(columnKey)) {
        return;
      }

      this.loadedRangeColumns.add(columnKey);
      this.loadDropdownOptionsForColumn(
        columnKey,
        '',
        1,
        false,
        this.rangeRequestFields[columnKey]
      );
      return;
    }

    this.dropdownSearchTermMap[columnKey] = '';
    this.dropdownOptionsMap[columnKey] = [];
    this.dropdownPageMap[columnKey] = 0;
    this.dropdownHasMoreMap[columnKey] = true;
    this.loadDropdownOptionsForColumn(columnKey, '', 1, false);
  }

  onDropdownScrolled(columnKey: string): void {
    if (this.isRangeColumn(columnKey)) {
      return;
    }

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
      true
    );
  }

  private loadDropdownOptionsForColumn(
    columnKey: string,
    searchTerm: string,
    pageNumber: number,
    append: boolean,
    requestField?: ProductListField
  ): void {
    this.columnSearchSubject$.next({
      columnKey,
      searchTerm,
      pageNumber,
      append,
      requestField
    });
  }

  private isRangeColumn(
    columnKey: string,
  ): columnKey is 'price' | 'stockQuantity' {
    return columnKey === 'price' || columnKey === 'stockQuantity';
  }

  // handle Apply
  onFilterApply(_event: { columnKey: string }): void {
    this.pageNumber = 1;
    this.dispatchCurrentProductQuery();
  }

  // handle drop-down clear
  onFilterClear(columnKey: string): void {
    if (columnKey === 'price' || columnKey === 'stockQuantity') {
      const selectedRanges = { ...this.selectedRangesMap };
      delete selectedRanges[columnKey];
      this.selectedRangesMap = selectedRanges;
    } else if (columnKey === 'categoryName' || columnKey === 'brandName') {
      this.selectedFiltersMap = {
        ...this.selectedFiltersMap,
        [columnKey]: []
      };
    }
    this.pageNumber = 1;
    this.dispatchCurrentProductQuery();
  }

  onRangeFilterChanged(
    range: { columnKey: string; min: number; max: number },
  ): void {
    if (
      range.columnKey === 'price' ||
      range.columnKey === 'stockQuantity'
    ) {
      this.selectedRangesMap = {
        ...this.selectedRangesMap,
        [range.columnKey]: { min: range.min, max: range.max }
      };
    }
  }

  get hasActiveFilters(): boolean {
    return Boolean(
      this.searchControl.value?.trim() ||
      this.categoryControl.value !== null ||
      this.brandControl.value !== null ||
      Object.keys(this.selectedRangesMap).length > 0 ||
      Object.values(this.columnFilters).some((value) => value.trim()) ||
      Object.values(this.selectedFiltersMap).some(
        (selectedValues) => selectedValues.length > 0
      )
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
      [colKey]: currentSelected
    };
  }

  onTableFilterChanged(filters: Record<string, string>): void {
    const previousFilters = this.columnFilters;
    const searchKeys: Array<'name' | 'description'> = ['name', 'description'];
    const changedSearchKey = searchKeys.find(
      (key) => filters[key] !== previousFilters[key],
    );
    if (changedSearchKey && filters[changedSearchKey]?.trim()) {
      this.activeColumnSearchKey = changedSearchKey;
    } else if (
      this.activeColumnSearchKey &&
      !filters[this.activeColumnSearchKey]?.trim()
    ) {
      const otherKey =
        this.activeColumnSearchKey === 'name' ? 'description' : 'name';
      this.activeColumnSearchKey = filters[otherKey]?.trim() ? otherKey : null;
    }
    this.columnFilters = { ...filters };
    this.pageNumber = 1;
    this.dispatchCurrentProductQuery();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
