import { Component, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, take } from 'rxjs/operators';
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
  private router = inject(Router);
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
    this.store.select(selectAllBrands).pipe(take(1)).subscribe(brands => {
      if (!brands || brands.length === 0) {
        this.store.dispatch(BrandActions.loadBrands());
      }
    });

    this.store.select(selectAllCategories).pipe(take(1)).subscribe(categories => {
      if (!categories || categories.length === 0) {
        this.store.dispatch(CategoryActions.loadCategories());
      }
    });
  }
 
  private setupQueryAndSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchVal) => {
        this.router.navigate(['/products'], {
          queryParams: { search: searchVal || null },
          queryParamsHandling: 'merge'
        });
      });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const search = params['search'] || '';
        if (this.searchControl.value !== search) {
          this.searchControl.setValue(search, { emitEvent: false });
        }
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