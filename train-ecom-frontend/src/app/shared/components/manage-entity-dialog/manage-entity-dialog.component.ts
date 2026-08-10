import { Component, Inject, inject, OnInit, OnDestroy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Brand } from '../../../core/models/brand.model';
import { Category } from '../../../core/models/category.model';
import { Actions, ofType } from '@ngrx/effects';
import { selectBrandLoading } from '../../../core/store/brand/brand.selectors';
import { selectCategoryLoading } from '../../../core/store/category/category.selectors';
import * as BrandActions from '../../../core/store/brand/brand.action';
import * as CategoryActions from '../../../core/store/category/category.action';
import { BrandCategoryDialogComponent } from '../brand-category-dialog/brand-category-dialog.component';
import { ConfirmDialogServiceService } from '../../../core/services/confirm-dialog.service';

export interface ManageEntityDialogData {
  type: 'Brand' | 'Category';
}

@Component({
  selector: 'app-manage-entity-dialog',
  templateUrl: './manage-entity-dialog.component.html',
  styleUrl: './manage-entity-dialog.component.css',
})
export class ManageEntityDialogComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private destroy$ = new Subject<void>();
  private actions$ = inject(Actions);

  items$ = new BehaviorSubject<(Brand | Category)[]>([]);
  localItems: (Brand | Category)[] = [];
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  isFetching = false;

  isLoading$: Observable<boolean> | null = null;
  displayedColumns: string[] = ['name', 'actions'];

  get entityTitle(): string {
    return this.data.type === 'Category' ? 'Categories' : 'Brands';
  }

  constructor(
    public dialogRef: MatDialogRef<ManageEntityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ManageEntityDialogData,
  ) {}

  hasMore = true;

  ngOnInit(): void {
    if (this.data.type === 'Brand') {
      this.isLoading$ = this.store.select(selectBrandLoading);

      this.actions$.pipe(
        ofType(BrandActions.loadPaginatedBrandsSuccess),
        takeUntil(this.destroy$)
      ).subscribe(({ brands, pageNumber }) => {
        this.isFetching = false;
        this.hasMore = brands.length === this.pageSize;
        if (pageNumber === 1) {
          this.localItems = brands;
        } else {
          this.localItems = [...this.localItems, ...brands];
        }
        this.items$.next(this.localItems);
      });

      this.fetchBrands();

    } else {
      this.isLoading$ = this.store.select(selectCategoryLoading);

      this.actions$.pipe(
        ofType(CategoryActions.loadPaginatedCategoriesSuccess),
        takeUntil(this.destroy$)
      ).subscribe(({ categories, pageNumber }) => {
        this.isFetching = false;
        this.hasMore = categories.length === this.pageSize;
        if (pageNumber === 1) {
          this.localItems = categories;
        } else {
          this.localItems = [...this.localItems, ...categories];
        }
        this.items$.next(this.localItems);
      });

      this.fetchCategories();
    }
  }

  fetchBrands(): void {
    this.isFetching = true;
    this.store.dispatch(BrandActions.loadPaginatedBrands({ pageNumber: this.currentPage, pageSize: this.pageSize }));
  }

  fetchCategories(): void {
    this.isFetching = true;
    this.store.dispatch(CategoryActions.loadPaginatedCategories({ pageNumber: this.currentPage, pageSize: this.pageSize }));
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    // Math.ceil handles fractional pixels on some displays
    if (Math.ceil(target.scrollTop) + target.clientHeight >= target.scrollHeight - 10) {
      if (!this.isFetching && this.hasMore) {
        this.currentPage++;
        if (this.data.type === 'Brand') {
          this.fetchBrands();
        } else {
          this.fetchCategories();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAdd(): void {
    this.openAddEditDialog();
  }

  onEdit(item: Brand | Category): void {
    this.openAddEditDialog(item);
  }

  onDelete(id: string): void {
    this.confirmDialog
      .confirm(
        `Are you sure you want to delete this ${this.data.type}?`,
        'Delete',
        'Cancel',
      )
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          if (this.data.type === 'Brand') {
            this.store.dispatch(BrandActions.deleteBrand({ brandId: id }));
          } else {
            this.store.dispatch(
              CategoryActions.deleteCategory({ categoryId: id }),
            );
          }
          this.localItems = this.localItems.filter(item => item.id !== id);
          this.items$.next(this.localItems);
          this.totalRecords = Math.max(0, this.totalRecords - 1);
        }
      });
  }

  private openAddEditDialog(item?: Brand | Category): void {
    const isEdit = !!item;
    const dialogRef = this.dialog.open(BrandCategoryDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: isEdit ? `Edit ${this.data.type}` : `Add ${this.data.type}`,
        type: this.data.type,
        isEdit: isEdit,
        initialData: item
          ? { name: item.name, description: item.description }
          : null,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          if (isEdit) {
            if (this.data.type === 'Brand') {
              this.store.dispatch(
                BrandActions.updateBrand({
                  brandId: item.id,
                  brand: result as Brand,
                }),
              );
            } else {
              this.store.dispatch(
                CategoryActions.updateCategory({
                  categoryId: item.id,
                  category: result as Category,
                }),
              );
            }
            this.localItems = this.localItems.map(i => i.id === item.id ? { ...i, ...result } : i);
            this.items$.next(this.localItems);
          } else {
            if (this.data.type === 'Brand') {
              this.store.dispatch(
                BrandActions.createBrand({ brand: result as Brand }),
              );
              this.actions$.pipe(
                ofType(BrandActions.createBrandSuccess),
                takeUntil(this.destroy$)
              ).subscribe(({ brand }) => {
                if (brand && brand.id) {
                  this.dialogRef.close(brand.id);
                }
              });
            } else {
              this.store.dispatch(
                CategoryActions.createCategory({
                  category: result as Category,
                }),
              );
              this.actions$.pipe(
                ofType(CategoryActions.createCategorySuccess),
                takeUntil(this.destroy$)
              ).subscribe(({ category }) => {
                if (category && category.id) {
                  this.dialogRef.close(category.id);
                }
              });
            }
          }
        }
      });
  }
}
