import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { Product } from '../../../../core/models/product.model';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { selectAllProducts, selectProductsLoading } from '../../../../core/store/product/product.selectors';
import * as ProductActions from '../../../../core/store/product/product.action';
import { Location } from '@angular/common';
 
import * as CategoryActions from '../../../../core/store/category/category.action';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';
 
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
 
  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);
  brands$: Observable<Brand[]> = this.store.select(selectAllBrands);
  private destroy$ = new Subject<void>();
 
  filteredProducts$!: Observable<Product[]>;
 
  minPriceFilter$ = new BehaviorSubject<number | null>(null);
  maxPriceFilter$ = new BehaviorSubject<number | null>(null);
  ratingFilter$ = new BehaviorSubject<number | null>(null);
  sortBy$ = new BehaviorSubject<string>('');
 
  activeMinPrice: number | null = null;
  activeMaxPrice: number | null = null;
  activeRating: number | null = null;
  activeSort: string = '';
 
  showMobileFilters: boolean = false;
  maxPriceSliderValue: number = 10000;
 
  ngOnInit() {
    this.initStoreData();
    this.dispatchLoadWithCurrentParams();
    this.setupFilteredProducts();
  }

 
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.dispatchLoadWithCurrentParams({ categoryName: categoryName || null });
  }
 
  onBrandChange(brandName: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { brand: brandName || null },
      queryParamsHandling: 'merge'
    });
    this.dispatchLoadWithCurrentParams({ brandName: brandName || null });
  }
 
  private dispatchLoadWithCurrentParams(overrides?: {
    brandName?: string | null;
    categoryName?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortBy?: string | null;
  }) {
    const queryParams = this.route.snapshot.queryParamMap;
    const brandName = overrides?.brandName ?? queryParams.get('brand') ?? undefined;
    const categoryName = overrides?.categoryName ?? queryParams.get('category') ?? undefined;
    const search = queryParams.get('search') || undefined;
    const minPrice = overrides?.minPrice ?? this.minPriceFilter$.value ?? undefined;
    const maxPrice = overrides?.maxPrice ?? this.maxPriceFilter$.value ?? undefined;
    const sortBy = overrides?.sortBy ?? (this.sortBy$.value || undefined);
 
    this.store.dispatch(ProductActions.loadProducts({
      pageNumber: 1,
      pageSize: 20,
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
    this.dispatchLoadWithCurrentParams({ minPrice: min, maxPrice: max });
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
    this.dispatchLoadWithCurrentParams({ sortBy: sort || null });
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
      sortBy: null
    });
  }
 
  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }
 
  goBack() {
    this.location.back();
  }
}
