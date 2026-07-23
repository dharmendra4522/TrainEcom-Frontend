import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild('chipsContainer', { static: false }) chipsContainer!: ElementRef;

  brands$: Observable<Brand[]> = this.store.select(selectAllBrands);
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);

  searchControl = new FormControl('');

  ngOnInit() {
    this.store.dispatch(BrandActions.loadBrands());
    this.store.dispatch(CategoryActions.loadCategories());

    combineLatest([
      this.route.queryParams.pipe(startWith({})),
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(400), 
        distinctUntilChanged(),
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, searchVal]: [any, any]) => {
        const brand = params['brand'];
        const category = params['category'];

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

  scrollChips(direction: 'left' | 'right'): void {
    const container = this.chipsContainer.nativeElement;
    const scrollAmount = 200;

    if(direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
