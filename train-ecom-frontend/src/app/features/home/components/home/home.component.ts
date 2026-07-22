import { Component, inject, OnInit } from '@angular/core';
import { Brand, Category, Product } from '../../../../core/models/product.model';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts, selectProductsLoading } from '../../../../core/store/product/product.selectors';
import { Observable } from 'rxjs';
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

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);

  brands$: Observable<Brand[]> = this.store.select(selectAllBrands);
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);

  ngOnInit() {
    this.fetchProducts();
    this.store.dispatch(BrandActions.loadBrands());
    this.store.dispatch(CategoryActions.loadCategories());
  }

  private fetchProducts(): void {
    this.store.dispatch(ProductActions.loadProducts({ pageNumber: 1, pageSize: 20 }));
  }
}
