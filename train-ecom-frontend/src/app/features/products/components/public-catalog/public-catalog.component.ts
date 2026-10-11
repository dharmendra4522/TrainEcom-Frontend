import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import {
  map,
  take,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { Product } from '../../../../core/models/product.model';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import {
  selectAllProducts,
  selectProductsLoading,
  selectProductTotalPages,
} from '../../../../core/store/product/product.selectors';
import * as ProductActions from '../../../../core/store/product/product.action';
import { Location } from '@angular/common';

import * as CategoryActions from '../../../../core/store/category/category.action';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';

// for virtual scrolling
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-public-catalog',
  templateUrl: './public-catalog.component.html',
  styleUrl: './public-catalog.component.css',
})
export class PublicCatalogComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  public route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private breakpointObserver = inject(BreakpointObserver);

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);
  brands$: Observable<Brand[]> = this.store.select(selectAllBrands);
  private destroy$ = new Subject<void>();
  private priceSubject$ = new Subject<number>();

  // Observer for Virtual DOM
  productRows$!: Observable<Product[][]>;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerRow: number = 3; // default to 3 items per row for larger screens

  filteredProducts$!: Observable<Product[]>;

  // filter and sort related BehaviorSubjects
  minPriceFilter$ = new BehaviorSubject<number | null>(null);
  maxPriceFilter$ = new BehaviorSubject<number | null>(null);
  ratingFilter$ = new BehaviorSubject<number | null>(null);
  sortBy$ = new BehaviorSubject<string>('');

  // Active filter states for UI
  activeMinPrice: number | null = null;
  activeMaxPrice: number | null = null;
  activeRating: number | null = null;
  activeSort: string = '';

  showMobileFilters: boolean = false;
  maxPriceSliderValue: number = 10000;

  ngOnInit(): void {
    this.setupFilteredProducts();
    this.subscribeToTotalPages();
    this.setupBreakpointObserver();
    this.setupProductRowsStream();
    this.initStoreData();
    this.setupQueryParamsSubscription();
    this.setupScrollListener();
    this.setupPriceDebounce();
  }

  private setupPriceDebounce(): void {
    this.priceSubject$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value >= 10000) {
          this.setPriceRange(150, null);
        } else {
          this.setPriceRange(150, value);
        }
      });
  }

  /** Initialize filtered products stream */
  private setupFilteredProducts(): void {
    this.filteredProducts$ = this.products$;
  }

  /** Subscribe to total pages store updates */
  private subscribeToTotalPages(): void {
    this.store
      .select(selectProductTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe((totalPages) => {
        this.totalPages = totalPages || 1;
      });
  }

  /** Setup breakpoint observer for responsive items per row */
  private setupBreakpointObserver(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.itemsPerRow = result.matches ? 2 : 3;
      });
  }

  /** Create chunked product rows stream */
  private setupProductRowsStream(): void {
    this.productRows$ = this.filteredProducts$.pipe(
      map((products) => this.chunkArray(products, this.itemsPerRow)),
    );
  }

  /** Handle query params changes from URL */
  private setupQueryParamsSubscription(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const urlSortBy = params['sortBy'];
        if (urlSortBy && urlSortBy !== this.sortBy$.value) {
          this.sortBy$.next(urlSortBy);
          this.activeSort = urlSortBy;
        }

        const urlMinRating = params['minRating']
          ? Number(params['minRating'])
          : null;
        if (urlMinRating !== this.ratingFilter$.value) {
          this.ratingFilter$.next(urlMinRating);
          this.activeRating = urlMinRating;
        }

        this.currentPage = 1;
        this.dispatchLoadWithCurrentParams({
          pageNumber: 1,
          isAppend: false,
          sortBy: urlSortBy,
        });
      });
  }

  /** Attach window scroll listener for infinite scrolling */
  private setupScrollListener(): void {
    window.addEventListener('scroll', this.onContainerScroll, true);
  }

  /** Helper method to chunk an array into smaller arrays of a specified size */
  private chunkArray(arr: Product[], chunkSize: number): Product[][] {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      res.push(arr.slice(i, i + chunkSize));
    }
    return res;
  }

  /** Handle container scroll events for infinite loading */
  onContainerScroll = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!target || !target.tagName) return;
    if (
      target.tagName !== 'MAT-SIDENAV-CONTENT' &&
      !target.classList?.contains('mat-drawer-content') &&
      !target.classList?.contains('main-content')
    ) {
      return;
    }

    const scrollPosition = target.scrollTop + target.clientHeight;
    const threshold = target.scrollHeight - 350;

    if (scrollPosition >= threshold) {
      this.isLoading$.pipe(take(1)).subscribe((isLoading) => {
        if (!isLoading && this.currentPage < this.totalPages) {
          this.currentPage++;
          this.dispatchLoadWithCurrentParams({
            pageNumber: this.currentPage,
            isAppend: true,
          });
        }
      });
    }
  };

  /** Load initial categories and brands metadata into store */
  private initStoreData(): void {
    this.categories$.pipe(take(1)).subscribe((categories) => {
      if (!categories || categories.length === 0) {
        this.store.dispatch(CategoryActions.loadCategories());
      }
    });

    this.brands$.pipe(take(1)).subscribe((brands) => {
      if (!brands || brands.length === 0) {
        this.store.dispatch(BrandActions.loadBrands());
      }
    });
  }

  /** Handle category filter change */
onCategoryChange(categoryId: string): void {
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {
      category: categoryId || null,
      subCategory: null,
    },
    queryParamsHandling: 'merge',
  });
}

  onSubCategoryChange(subCategoryId: string): void {
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {
      subCategory: subCategoryId || null,
    },
    queryParamsHandling: 'merge',
  });
}

  /** Handle brand filter change */
  onBrandChange(brandId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { brand: brandId || null },
      queryParamsHandling: 'merge'
    });
  }

  /** Dispatch load products action with current filters and parameters */
  private dispatchLoadWithCurrentParams(overrides?: {
    pageNumber?: number;
    isAppend?: boolean;
    brandId?: string | null;
    categoryId?: string | null;
    subCategoryId?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortBy?: string | null;
    minRating?: number | null;
  }): void {
    if (overrides && overrides.isAppend === false) {
      this.currentPage = 1;
    }

    const queryParams = this.route.snapshot.queryParamMap;

    const brandValue =
      overrides && 'brandId' in overrides
        ? overrides.brandId || undefined
        : queryParams.get('brand') || undefined;

    const categoryValue =
      overrides && 'categoryId' in overrides
        ? overrides.categoryId || undefined
        : queryParams.get('category') || undefined;
    const subCategoryValue =
      overrides && 'subCategoryId' in overrides
        ? overrides.subCategoryId || undefined
        : queryParams.get('subCategory') || undefined;

    const parsedBrandId = brandValue ? Number(brandValue) : undefined;
    const parsedCategoryId = categoryValue ? Number(categoryValue) : undefined;
    const parsedSubCategoryId = subCategoryValue ? Number(subCategoryValue) : undefined;
    const brandId =
      parsedBrandId !== undefined && Number.isFinite(parsedBrandId)
        ? parsedBrandId
        : undefined;
    const categoryId =
      parsedCategoryId !== undefined && Number.isFinite(parsedCategoryId)
        ? parsedCategoryId
        : undefined;
    const subCategoryId =
      parsedSubCategoryId !== undefined && Number.isFinite(parsedSubCategoryId)
        ? parsedSubCategoryId
        : undefined;

    const search = queryParams.get('search') || undefined;
    const minPrice = this.getParamValue(overrides, 'minPrice', this.minPriceFilter$.value ?? undefined)
    const maxPrice = this.getParamValue(overrides, 'maxPrice', this.maxPriceFilter$.value ?? undefined);
    const sortBy = this.getParamValue(overrides, 'sortBy', this.sortBy$.value || undefined);
    const minRating = this.getParamValue(overrides, 'minRating', this.ratingFilter$.value ?? undefined, (val) => Number(val));


    const pageNumber = overrides?.pageNumber || this.currentPage;
    const isAppend = overrides?.isAppend || false;

    this.store.dispatch(
      ProductActions.loadProducts({
        pageNumber,
        pageSize: 10,
        isAppend,
        brandIds: brandId !== undefined ? [brandId] : undefined,
        categoryIds: categoryId !== undefined ? [categoryId] : undefined,
        subCategoryIds: subCategoryId !== undefined ? [subCategoryId] : undefined,
        search,
        minPrice,
        maxPrice,
        sortBy,
        minRating,
      }),
    );
  }

  // helper function to extract query parameters and overrides
  private getParamValue<T>(
    overrides: Record<string, unknown> | undefined,
    key: string,
    fallbackValue: T | undefined,
    tranform?: (val: string) => T
  ): T | undefined {
    if (overrides && key in overrides) {
      const val = overrides[key];
      return val != null && val !== undefined ? (val as T) : undefined;
    }
    const paramVal = this.route.snapshot.queryParamMap.get(key);
    if (paramVal !== null && paramVal !== undefined) {
      return tranform ? tranform(paramVal) : (paramVal as unknown as T)
    }
    return fallbackValue;
  }


  /** Set price range filter values */
  setPriceRange(min: number | null, max: number | null): void {
    this.minPriceFilter$.next(min);
    this.maxPriceFilter$.next(max);
    this.activeMinPrice = min;
    this.activeMaxPrice = max;
    this.currentPage = 1;
    this.dispatchLoadWithCurrentParams({
      minPrice: min,
      maxPrice: max,
      isAppend: false,
      pageNumber: 1,
    });
  }

  /** Handle price slider input change */
  onPriceSliderChange(value: number): void {
    this.maxPriceSliderValue = value;
    this.priceSubject$.next(value);
  }

  /** Set minimum rating filter */
  setRating(rating: number | null): void {
    this.ratingFilter$.next(rating);
    this.activeRating = rating;
    this.currentPage = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { minRating: rating || null },
      queryParamsHandling: 'merge',
    });
  }

  /** Set sorting parameter */
  setSortBy(sort: string): void {
    this.sortBy$.next(sort);
    this.activeSort = sort;
    this.currentPage = 1;
    this.dispatchLoadWithCurrentParams({
      sortBy: sort || null,
      isAppend: false,
      pageNumber: 1,
    });
  }

  /** Reset all filters and clear query parameters */
  resetFilters(): void {
    this.minPriceFilter$.next(null);
    this.maxPriceFilter$.next(null);
    this.ratingFilter$.next(null);
    this.sortBy$.next('');
    this.activeMinPrice = null;
    this.activeMaxPrice = null;
    this.activeRating = null;
    this.activeSort = '';
    this.maxPriceSliderValue = 10000;
    this.currentPage = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        brand: null,
        category: null,
        subCategory: null,
        minRating: null,
        sortBy: null,
        search: null
      },
      queryParamsHandling: 'merge'
    });
  }

  /** Toggle mobile filter visibility */
  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  /** Navigate back to the previous location */
  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onContainerScroll, true);
  }
}
