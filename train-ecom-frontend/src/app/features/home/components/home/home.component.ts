import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts, selectProductsLoading } from '../../../../core/store/product/product.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private store = inject(Store);

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);

  ngOnInit() {
    this.fetchProducts();
  }

  private fetchProducts(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }
}
