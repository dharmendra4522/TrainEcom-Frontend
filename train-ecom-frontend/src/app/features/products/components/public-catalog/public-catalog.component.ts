import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Product } from '../../../../core/models/product.model';
import { selectAllProducts, selectProductsLoading } from '../../../../core/store/product/product.selectors';
import * as ProductActions from '../../../../core/store/product/product.action';
import { Location } from '@angular/common';

@Component({
  selector: 'app-public-catalog',
  templateUrl: './public-catalog.component.html',
  styleUrl: './public-catalog.component.css'
})
export class PublicCatalogComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  products$: Observable<Product[]> = this.store.select(selectAllProducts);
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);

  filteredProductRows$!: Observable<Product[][]>;

  ngOnInit() {
    this.store.select(selectAllProducts).subscribe(products => {
      if (!products || products.length === 0) {
        this.store.dispatch(ProductActions.loadProducts({ pageNumber: 1, pageSize: 20 }));
      }
    });

    this.filteredProductRows$ = combineLatest([
      this.products$,
      this.route.queryParams.pipe(startWith({}))
    ]).pipe(
      map(([products, params]: [Product[], any]) => {
        if (!products) return [];

        const brand = params['brand']?.toLowerCase().trim();
        const category = params['category']?.toLowerCase().trim();

        const filtered = products.filter(product => {
          const prodBrand = (product.brandName || '').toLowerCase().trim();
          const prodCategory = (product.categoryName || '').toLowerCase().trim();

          const matchesBrand = brand ? prodBrand === brand : true;
          const matchesCategory = category ? prodCategory === category : true;

          return matchesBrand && matchesCategory;
        });

        return this.chunkArray(filtered, 4);
      })
    );
  }

   goBack(){
      this.location.back();
    }

  private chunkArray(arr: Product[], chunkSize: number): Product[][] {
    const results: Product[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      results.push(arr.slice(i, i + chunkSize));
    }
    return results;
  }
}