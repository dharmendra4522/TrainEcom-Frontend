import { Component, inject, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { map, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-grouped-product-row',
  templateUrl: './grouped-product-row.component.html',
  styleUrl: './grouped-product-row.component.css'
})
export class GroupedProductRowComponent implements OnInit {
  private productService = inject(ProductService);

  @Input() title!: string;
  @Input() filterType: 'brand' | 'category' | 'newest' = 'brand';
  @Input() filterValue!: string;

  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLDivElement>;

  products$!: Observable<Product[]>;
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  ngOnInit() {
    this.initFilteredProducts();
  }

  private initFilteredProducts(): void {
    this.isLoadingSubject.next(true);

    let fetch$: Observable<Product[]> = of([]);

    if (this.filterType === 'brand') {
      fetch$ = this.productService.getPaginatedProducts(1, 6, this.filterValue).pipe(
        map(res => res.items)
      );
    } else if (this.filterType === 'category') {
      fetch$ = this.productService.getPaginatedProducts(1, 6, undefined, this.filterValue).pipe(
        map(res => res.items)
      );
    } else if (this.filterType === 'newest') {
      fetch$ = this.productService.getPaginatedProducts(1, 10, undefined, undefined, undefined, undefined, undefined, 'Newest').pipe(
        map(res => res.items)
      );
    }

    this.products$ = fetch$.pipe(
      tap(() => this.isLoadingSubject.next(false)),
      catchError(() => {
        this.isLoadingSubject.next(false);
        return of([]);
      })
    );
  }

  scrollGrid(amount: number): void {
    if (this.gridContainer) {
      this.gridContainer.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }
}
