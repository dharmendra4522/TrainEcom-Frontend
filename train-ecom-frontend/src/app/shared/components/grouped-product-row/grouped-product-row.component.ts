import { Component, inject, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllProducts, selectProductsLoading } from '../../../core/store/product/product.selectors';
import { Observable } from 'rxjs/internal/Observable';
import { Product } from '../../../core/models/product.model';
import * as ProductActions from '../../../core/store/product/product.action';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-grouped-product-row',
  templateUrl: './grouped-product-row.component.html',
  styleUrl: './grouped-product-row.component.css'
})
export class GroupedProductRowComponent {
  private store = inject(Store);


  @Input() title!: string;
  @Input() filterType: 'brand' | 'category' = 'brand';
  @Input() filterValue!: string;

  products$!: Observable<Product[]>;
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);

  ngOnInit() {
    this.initFilteredProducts();
  }

  private initFilteredProducts(): void {
    this.products$ = this.store.select(selectAllProducts).pipe(
      map(products => {
        if (this.filterType === 'brand') {
          return products.filter(product => product.brandName === this.filterValue).slice(0, 4);
        } else if (this.filterType === 'category') {
          return products.filter(product => product.categoryName === this.filterValue).slice(0, 4);
        }
        return products;
      })
    )
  }

}
