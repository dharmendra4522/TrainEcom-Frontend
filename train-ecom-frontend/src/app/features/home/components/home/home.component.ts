import { Component, inject, OnInit } from '@angular/core';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { Store } from '@ngrx/store';
import { map, Observable, take } from 'rxjs';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import * as CategoryActions from '../../../../core/store/category/category.action';
import * as BrandActions from '../../../../core/store/brand/brand.action';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private store = inject(Store);

  brands$: Observable<Brand[]> = this.store.select(selectAllBrands).pipe(
    map((brands) =>
      brands
        .filter((brand) => (brand.numberOfProducts ?? brand.productCount ?? 6) >= 6)
        .slice(0, 3),
    ),
  );

  categories$: Observable<Category[]> = this.store
    .select(selectAllCategories)
    .pipe(
      map((categories) =>
        categories
          .filter(
            (category) =>
              (category.numberOfProducts ?? category.productCount ?? 6) >= 6,
          )
          .slice(0, 3),
      ),
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

  onBannerBuyNow(): void {
    console.log('Buy Now button clicked from banner');
  }
}
