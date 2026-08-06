import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { Product } from '../../../../core/models/product.model';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { selectAllProducts, selectProductsLoading, selectProductTotalPages } from '../../../../core/store/product/product.selectors';
import * as ProductActions from '../../../../core/store/product/product.action';
import { Location } from '@angular/common';

import * as CategoryActions from '../../../../core/store/category/category.action';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';

// for virtual scrolling
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-public-catalog',
  templateUrl: './public-catalog.component.html',
  styleUrl: './public-catalog.component.css'
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

  // Observer for Virtual DOM
  productRows$!: Observable<Product[][]>;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerRow: number = 3; // default to 3 items per row for larger screens

  // For virtual scrolling
  @ViewChild(CdkVirtualScrollViewport) virtualScroll!: CdkVirtualScrollViewport;


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

  ngOnInit() {
    this.setupFilteredProducts();

    // Subscribe to totalPages from store
    this.store
      .select(selectProductTotalPages)
      .pipe(takeUntil(this.destroy$))
      .subscribe((totalPages) => {
        this.totalPages = totalPages || 1;
      });

    // set responsive columns from breakpoint observer
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.itemsPerRow = result.matches ? 2 : 3;
      });

    // Products array ko Rows me chunk (divide) karein
    this.productRows$ = this.filteredProducts$.pipe(
      map(products => this.chunkArray(products, this.itemsPerRow))
    );

    this.initStoreData();

    // Subscribe to URL query parameters change to reset pagination and load strictly filtered products
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.dispatchLoadWithCurrentParams({ pageNumber: 1, isAppend: false });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper method to chunk an array into smaller arrays of a specified size
  private chunkArray(arr: Product[], chunkSize: number): Product[][] {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      res.push(arr.slice(i, i + chunkSize));
    }
    return res;
  }

  // Listen to window scroll event for automatic 10-by-10 infinite scroll loading
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 350;

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
  }

  private initStoreData(): void {
    this.categories$.pipe(take(1)).subscribe(categories => {
      if (!categories || categories.length === 0) {
        this.store.dispatch(CategoryActions.loadCategories());
      }
    });

    this.brands$.pipe(take(1)).subscribe(brands => {
      if (!brands || brands.length === 0) {
        this.store.dispatch(BrandActions.loadBrands());
      }
    });
  }

  private setupFilteredProducts(): void {
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.ratingFilter$
    ]).pipe(
      map(([products, rating]) => this.filterProductsList(products, rating))
    );
  }

  private filterProductsList(products: Product[], rating: number | null): Product[] {
    if (!products) {
      return [];
    }

    if (rating === null) {
      return products;
    }

    return products.filter(product => {
      const numId = Number(product.id) || 0;
      const prodRating = product.rating || (4.0 + (numId % 10) / 10.0);
      return prodRating >= rating;
    });
  }

  onCategoryChange(categoryName: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: categoryName || null },
      queryParamsHandling: 'merge'
    });
  }

  onBrandChange(brandName: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { brand: brandName || null },
      queryParamsHandling: 'merge'
    });
  }

  private dispatchLoadWithCurrentParams(overrides?: {
    pageNumber?: number;
    isAppend?: boolean;
    brandName?: string | null;
    categoryName?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortBy?: string | null;
  }) {
    if (overrides && overrides.isAppend === false) {
      this.currentPage = 1;
    }

    const queryParams = this.route.snapshot.queryParamMap;

    const brandName = overrides && 'brandName' in overrides
      ? (overrides.brandName || undefined)
      : (queryParams.get('brand') || undefined);

    const categoryName = overrides && 'categoryName' in overrides
      ? (overrides.categoryName || undefined)
      : (queryParams.get('category') || undefined);

    const search = queryParams.get('search') || undefined;

    const minPrice = overrides && 'minPrice' in overrides
      ? (overrides.minPrice ?? undefined)
      : (this.minPriceFilter$.value ?? undefined);

    const maxPrice = overrides && 'maxPrice' in overrides
      ? (overrides.maxPrice ?? undefined)
      : (this.maxPriceFilter$.value ?? undefined);

    const sortBy = overrides && 'sortBy' in overrides
      ? (overrides.sortBy || undefined)
      : (this.sortBy$.value || undefined);

    const pageNumber = overrides?.pageNumber || this.currentPage;
    const isAppend = overrides?.isAppend || false;

    this.store.dispatch(ProductActions.loadProducts({
      pageNumber,
      pageSize: 10,
      isAppend,
      brandName,
      categoryName,
      search,
      minPrice,
      maxPrice,
      sortBy
    }));
  }

  setPriceRange(min: number | null, max: number | null) {
    this.minPriceFilter$.next(min);
    this.maxPriceFilter$.next(max);
    this.activeMinPrice = min;
    this.activeMaxPrice = max;
    this.currentPage = 1;
    this.dispatchLoadWithCurrentParams({ minPrice: min, maxPrice: max, isAppend: false, pageNumber: 1 });
  }

  onPriceSliderChange(value: number) {
    this.maxPriceSliderValue = value;
    if (value >= 10000) {
      this.setPriceRange(150, null);
    } else {
      this.setPriceRange(150, value);
    }
  }

  setRating(rating: number | null) {
    this.ratingFilter$.next(rating);
    this.activeRating = rating;
  }

  setSortBy(sort: string) {
    this.sortBy$.next(sort);
    this.activeSort = sort;
    this.currentPage = 1;
    this.dispatchLoadWithCurrentParams({ sortBy: sort || null, isAppend: false, pageNumber: 1 });
  }

  resetFilters() {
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
      queryParams: { brand: null, category: null },
      queryParamsHandling: 'merge'
    });
    this.dispatchLoadWithCurrentParams({
      brandName: null,
      categoryName: null,
      minPrice: null,
      maxPrice: null,
      sortBy: null,
      isAppend: false,
      pageNumber: 1
    });
  }

toggleMobileFilters() {
  this.showMobileFilters = !this.showMobileFilters;
}

goBack() {
  this.location.back();
}
}
