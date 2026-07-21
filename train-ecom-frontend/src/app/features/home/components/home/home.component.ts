import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectAllProducts } from '../../../../core/store/product/product.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  private store = inject(Store);

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  products: Product[] = [];

  ngOnInit() {
    this.fetchProducts();
  }

  private fetchProducts(): void {
    this.store.dispatch(ProductActions.loadProducts());
    this.products$.subscribe((products) => {
      if (products) {
        this.products = products;
      }
    });
  }
}
