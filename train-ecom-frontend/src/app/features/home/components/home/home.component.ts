import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts, selectProductsLoading } from '../../../../core/store/product/product.selectors';
import { map, Observable, take, switchMap, forkJoin, of, catchError } from 'rxjs';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import * as CategoryActions from '../../../../core/store/category/category.action';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private store = inject(Store);
  private productService = inject(ProductService);

  // Helper to validate and check product availability (>= 6 products threshold)
  private checkAvailability(item: Brand | Category, filterType: 'brand' | 'category'): Observable<{ item: Brand | Category; isValid: boolean }> {
    const num = item['numberOfProducts'] ?? item['productCount'];
    if (num !== undefined && num !== null) {
      return of({ item, isValid: Number(num) >= 6 });
    }

    const brandName = filterType === 'brand' ? item.name : undefined;
    const categoryName = filterType === 'category' ? item.name : undefined;

    return this.productService.getPaginatedProducts(1, 6, brandName, categoryName).pipe(
      map(res => ({ item, isValid: (res.totalRecords ?? res.items?.length ?? 0) >= 6 })),
      catchError(() => of({ item, isValid: false }))
    );
  }

  // Stream of 2-3 valid brands with >= 6 products
  brands$: Observable<Brand[]> = this.store.select(selectAllBrands).pipe(
    switchMap(brands => {
      if (!brands || brands.length === 0) return of([]);

      const checks$ = brands.map(b => this.checkAvailability(b, 'brand'));
      return forkJoin(checks$).pipe(
        map(results =>
          results
            .filter(r => r.isValid)
            .map(r => r.item as Brand)
            .slice(0, 3)
        )
      );
    })
  );

  // Stream of 2-3 valid categories with >= 6 products
  categories$: Observable<Category[]> = this.store.select(selectAllCategories).pipe(
    switchMap(categories => {
      if (!categories || categories.length === 0) return of([]);

      const checks$ = categories.map(c => this.checkAvailability(c, 'category'));
      return forkJoin(checks$).pipe(
        map(results =>
          results
            .filter(r => r.isValid)
            .map(r => r.item as Category)
            .slice(0, 3)
        )
      );
    })
  );

ngOnInit() {
  this.initStoreData();
}

private initStoreData(): void {
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

  onBannerBuyNow() {
    console.log('Buy Now button clicked from banner');
  }
}
