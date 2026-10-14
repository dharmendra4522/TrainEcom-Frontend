import { Component, inject, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { map, catchError, tap } from 'rxjs/operators';
import { PortalKey } from '../../../core/config/management-access.config';

@Component({
  selector: 'app-grouped-product-row',
  templateUrl: './grouped-product-row.component.html',
  styleUrl: './grouped-product-row.component.css'
})
export class GroupedProductRowComponent implements OnInit {
  private productService = inject(ProductService);

  @Input() title!: string;
  @Input() filterType: 'brand' | 'category' | 'newest' = 'brand';
  @Input() filterValue!: number | string;
  @Input() portal?: PortalKey;

  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLDivElement>;

  products$!: Observable<Product[]>;
  private pageSize: number = 10;
  private pageNumber: number = 1;
  // BehaviorSubject to manage the loading state of the products
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  ngOnInit() {
    this.initFilteredProducts();
  }

  // Initialize the products based on the filter type and value
  private initFilteredProducts(): void {
    this.isLoadingSubject.next(true);
    let fetch$: Observable<Product[]> = of([]);
    const filterId = Number(this.filterValue);
    if (this.filterType === 'brand') {
      fetch$ = this.productService
        .getPaginatedProducts({
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          brandIds: [filterId],
          portal: this.portal
        })
        .pipe(map((res) => res.items));
    } else if (this.filterType === 'category') {
      fetch$ = this.productService
        .getPaginatedProducts({
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          categoryIds: [filterId],
          portal: this.portal
        })
        .pipe(map((res) => res.items));
    } else if (this.filterType === 'newest') {
      fetch$ = this.productService
        .getPaginatedProducts({
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
          sortBy: 'Newest',
          portal: this.portal
        })
        .pipe(map((res) => res.items));
    }

    this.products$ = fetch$.pipe(
      tap(() => this.isLoadingSubject.next(false)),
      catchError(() => {
        this.isLoadingSubject.next(false);
        return of([]);
      })
    );
  }

  // Scroll the grid container by a specified amount
  scrollGrid(amount: number): void {
    if (this.gridContainer) {
      this.gridContainer.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }
}
