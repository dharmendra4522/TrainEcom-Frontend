import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Product, Brand, Category } from '../../../../core/models/product.model';
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
export class PublicCatalogComponent implements OnInit {
  private store = inject(Store);
  public route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);
  brands$: Observable<Brand[]> = this.store.select(selectAllBrands);

  filteredProducts$!: Observable<Product[]>;

  minPriceFilter$ = new BehaviorSubject<number | null>(null);
  maxPriceFilter$ = new BehaviorSubject<number | null>(null);
  ratingFilter$ = new BehaviorSubject<number | null>(null);
  sortBy$ = new BehaviorSubject<string>('popularity');

  activeMinPrice: number | null = null;
  activeMaxPrice: number | null = null;
  activeRating: number | null = null;
  activeSort: string = 'popularity';

  showMobileFilters: boolean = false;

  ngOnInit() {
    this.initStoreData();
    this.setupFilteredProducts();
  }

  private initStoreData(): void {
    this.products$.pipe(map(p => p.length === 0)).subscribe(isEmpty => {
      if (isEmpty) {
        this.store.dispatch(ProductActions.loadProducts({ pageNumber: 1, pageSize: 20 }));
      }
    });

    this.store.dispatch(CategoryActions.loadCategories());
    this.store.dispatch(BrandActions.loadBrands());
  }

  private setupFilteredProducts(): void {
    this.route.queryParamMap.subscribe(params => {
      this.dispatchLoadWithCurrentParams();
    });

    this.filteredProducts$ = combineLatest([
      this.products$,
      this.route.queryParams.pipe(startWith({})),
      this.minPriceFilter$,
      this.maxPriceFilter$,
      this.ratingFilter$,
      this.sortBy$
    ]).pipe(
      map(([products, params, minPrice, maxPrice, rating, sortBy]) => {
        if (!products) return [];

        this.updateActiveFilterUI(minPrice, maxPrice, rating, sortBy);

        const filtered = this.filterProductsList(products, params, minPrice, maxPrice, rating);

        return this.sortProductsList(filtered, sortBy);
      })
    );
  }

  private updateActiveFilterUI(min: number | null, max: number | null, rating: number | null, sort: string): void {
    this.activeMinPrice = min;
    this.activeMaxPrice = max;
    this.activeRating = rating;
    this.activeSort = sort;
  }

  // 4. Products filtering logic
  private filterProductsList(products: Product[], params: any, minPrice: number | null, maxPrice: number | null, rating: number | null): Product[] {
    const brand = params['brand']?.toLowerCase().trim();
    const category = params['category']?.toLowerCase().trim();

    return products.filter(product => {
      const prodBrand = (product.brandName || '').toLowerCase().trim();
      const prodCategory = (product.categoryName || '').toLowerCase().trim();

      const matchesBrand = brand ? prodBrand === brand : true;
      const matchesCategory = category ? prodCategory === category : true;

      const matchesMinPrice = minPrice !== null ? product.price >= minPrice : true;
      const matchesMaxPrice = maxPrice !== null ? product.price <= maxPrice : true;

      const numId = Number(product.id) || 0;
      const prodRating = (product as any).rating || (4.0 + (numId % 10) / 10.0);
      const matchesRating = rating !== null ? prodRating >= rating : true;

      return matchesBrand && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesRating;
    });
  }

  // 5. Products sorting logic
  private sortProductsList(products: Product[], sortBy: string): Product[] {
    let sorted = [...products];

    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    } else if (sortBy === 'popularity') {
      sorted.sort((a, b) => ((b.stockQuantity || 0) % 5) - ((a.stockQuantity || 0) % 5));
    }

    return sorted;
  }

  onCategoryChange(categoryName: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: categoryName || null },
      queryParamsHandling: 'merge'
    });
    this.dispatchLoadWithCurrentParams();
  }

  onBrandChange(brandName: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { brand: brandName || null },
      queryParamsHandling: 'merge'
    });
    this.dispatchLoadWithCurrentParams();
  }

  private dispatchLoadWithCurrentParams() {
    const queryParams = this.route.snapshot.queryParamMap;

    this.store.dispatch(ProductActions.loadProducts({
      pageNumber: 1,
      pageSize: 20,
      brandName: queryParams.get('brand') || undefined,
      categoryName: queryParams.get('category') || undefined,
      search: queryParams.get('search') || undefined
    }));
  }

  setPriceRange(min: number | null, max: number | null) {
    this.minPriceFilter$.next(min);
    this.maxPriceFilter$.next(max);
  }

  setRating(rating: number | null) {
    this.ratingFilter$.next(rating);
  }

  setSortBy(sort: string) {
    this.sortBy$.next(sort);
  }

  resetFilters() {
    this.minPriceFilter$.next(null);
    this.maxPriceFilter$.next(null);
    this.ratingFilter$.next(null);
    this.sortBy$.next('popularity');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { brand: null, category: null },
      queryParamsHandling: 'merge'
    });
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }

  goBack() {
    this.location.back();
  }
}