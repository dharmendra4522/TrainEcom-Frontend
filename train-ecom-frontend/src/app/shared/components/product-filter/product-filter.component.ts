import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import * as ProductActions from '../../../core/store/product/product.action';
import * as BrandActions from '../../../core/store/brand/brand.action';
import * as CategoryActions from '../../../core/store/category/category.action';
import { selectAllBrands } from '../../../core/store/brand/brand.selectors';
import { selectAllCategories } from '../../../core/store/category/category.selectors';
import { Brand, Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrl: './product-filter.component.css',
})
export class ProductFilterComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // 🔹 Select Brands and Categories streams from the store
  brands$: Observable<Brand[]> = this.store.select(selectAllBrands);
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);

  // Form control for the search input box
  searchControl = new FormControl('');

  ngOnInit() {
    // Ensure brands and categories are loaded in store
    this.store.dispatch(BrandActions.loadBrands());
    this.store.dispatch(CategoryActions.loadCategories());

    // 🔹 Combine Active Route Params (brand/category) and Search query inputs
    combineLatest([
      this.route.queryParams.pipe(startWith({})),
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(400), // Debouncing delay of 400ms
        distinctUntilChanged(), // Fire only if value actually changed
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, searchVal]: [any, any]) => {
        // Get current filtering context from routing params
        const brand = params['brand'];
        const category = params['category'];

        // Dispatch loadProducts action to fetch matched results from the API
        this.store.dispatch(
          ProductActions.loadProducts({
            pageNumber: 1,
            pageSize: 40,
            brandName: brand || undefined,
            categoryName: category || undefined,
            search: searchVal ? searchVal.trim() : undefined,
          }),
        );
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
// Recompile trigger check
