import { Component, inject, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
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
export class GroupedProductRowComponent implements OnInit {
  private store = inject(Store);


  @Input() title!: string;
  @Input() filterType: 'brand' | 'category' | 'newest' = 'brand';
  @Input() filterValue!: string;

  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLDivElement>;

  products$!: Observable<Product[]>;
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);

  ngOnInit() {
    this.initFilteredProducts();
  }

  private initFilteredProducts(): void {
    this.products$ = this.store.select(selectAllProducts).pipe(
      map(products => {
        const val = (this.filterValue || '').toLowerCase().trim();
        if (this.filterType === 'brand') {
          return products.filter(product => (product.brandName || '').toLowerCase().trim() === val).slice(0, 4);
        } else if (this.filterType === 'category') {
          return products.filter(product => (product.categoryName || '').toLowerCase().trim() === val).slice(0, 4);
        } else if (this.filterType === 'newest') {
          return [...products].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)).slice(0, 4);
        }
        return products;
      })
    )
  }

  scrollGrid(amount: number): void {
    if (this.gridContainer) {
      this.gridContainer.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

}
