import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import * as ProductActions from '../../../core/store/product/product.action';
import * as BrandActions from '../../../core/store/brand/brand.action';
import * as CategoryActions from '../../../core/store/category/category.action';
import { selectAllBrands } from '../../../core/store/brand/brand.selectors';
import { selectAllCategories } from '../../../core/store/category/category.selectors';
import { Brand } from '../../../core/models/brand.model';
import { Category } from '../../../core/models/category.model';
 
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
    this.loadFilterMetadata();
    this.setupQueryAndSearchSubscription();
  }
 
  private loadFilterMetadata(): void {
    this.store.dispatch(BrandActions.loadBrands());
    this.store.dispatch(CategoryActions.loadCategories());
  }
 
  private setupQueryAndSearchSubscription(): void {
    combineLatest([
      this.route.queryParams.pipe(startWith({})),
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, searchVal]) => {
        this.handleFilterChange(params, searchVal);
      });
  }
 
  private handleFilterChange(params: Params, searchVal: string | null): void {
    const brand = params['brand'];
    const category = params['category'];
    const searchString = searchVal ? searchVal.trim() : undefined;
 
    this.dispatchLoadProducts(brand, category, searchString);
  }
 
  private dispatchLoadProducts(brand?: string, category?: string, search?: string): void {
    this.store.dispatch(
      ProductActions.loadProducts({
        pageNumber: 1,
        pageSize: 40,
        brandName: brand || undefined,
        categoryName: category || undefined,
        search: search || undefined,
      })
    );
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