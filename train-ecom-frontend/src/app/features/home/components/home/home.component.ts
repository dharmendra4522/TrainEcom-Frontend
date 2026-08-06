import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts, selectProductsLoading } from '../../../../core/store/product/product.selectors';
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

  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);

  // Stream of brands (empty brands will be hidden automatically by template)
  brands$: Observable<Brand[]> = this.store.select(selectAllBrands).pipe(
    map(brands => brands.slice(0, 6))
  );

  // Stream of categories (showing max 3 category sections)
  categories$: Observable<Category[]> = this.store.select(selectAllCategories).pipe(
    map(categories => categories.slice(0, 3))
  );

  newestProducts$: Observable<Product[]> = this.store.select(selectAllProducts).pipe(
    map(products => [...products].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)).slice(0, 6))
  );

  ngOnInit() {
    // Initial fetch of catalog products so store is populated
    this.store.dispatch(ProductActions.loadProducts({ pageNumber: 1, pageSize: 50 }));

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
