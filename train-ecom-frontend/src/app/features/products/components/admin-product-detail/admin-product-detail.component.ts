import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/internal/Subject';
import { Product } from '../../../../core/models/product.model';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectProductById, selectProductsLoading } from '../../../../core/store/product/product.selectors';
import { take, takeUntil } from 'rxjs';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-product-detail',
  templateUrl: './admin-product-detail.component.html',
  styleUrl: './admin-product-detail.component.css',
})
export class AdminProductDetailComponent implements OnInit, OnDestroy {

  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private action$ = inject(Actions);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  selectedImageUrl: string | null = '';
  isLoading: boolean = false;

  ngOnInit() {
    this.loadProductDetails();
  }

  loadProductDetails(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Dispatch action to load product details by ID
      this.store.dispatch(ProductActions.loadProductById({ id }));
      // Subscribe to product data from store 
      this.store
        .select(selectProductById(id))
        .pipe(takeUntil(this.destroy$))
        .subscribe((prod) => {
          if (prod) {
            this.product = prod;
            this.setInitialImage(prod);
          }
        });
    }

    // Subscribe to loading state (independent of id)
    this.store
      .select(selectProductsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.isLoading = loading;
      });
  }

  setInitialImage(product: Product): void {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary);
      this.selectedImageUrl = primaryImage ? primaryImage.imageUrl : product.images[0].imageUrl;
    } else if (product.thumbnailUrl) {
      this.selectedImageUrl = product.thumbnailUrl;
    } else {
      this.selectedImageUrl = '';
    }
  }

  selectImage(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
  }

  onEditProduct(): void {
    if (this.product) {
      this.router.navigate(['/admin/products/edit', this.product.id]);
    }
  }

  onDeleteProduct(): void {
    if (!this.product) return;

    this.confirmDialog.confirm('Are you sure you want to delete this product?', 'Delete', 'Cancel').subscribe((confirmed) => {
      if (!confirmed || !this.product) return;
      const id = this.product.id.toString();
      this.store.dispatch(ProductActions.deleteProduct({ productId: id }));
      
      this.action$
        .pipe(
          ofType(ProductActions.deleteProductSuccess),
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(() => {
          this.router.navigate(['/admin/products/manage']);
        });
    });
  }


  onBackToList(): void {
    this.router.navigate(['/admin/products']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }



}
