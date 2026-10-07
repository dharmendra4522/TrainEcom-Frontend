import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Brand } from '../../../../core/models/brand.model';
import { BrandCategoryDialogComponent } from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
} from '../../../../core/models/table.model';
import { Store } from '@ngrx/store';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import {
  selectBrandLoading,
  selectBrandTotalRecords,
  selectPaginatedBrands,
} from '../../../../core/store/brand/brand.selectors';
import { Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  debounceTime,
  takeUntil,
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { map, filter } from 'rxjs/operators';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit, OnDestroy { 
  private matDialog = inject(MatDialog);
  private store = inject(Store);
  private confirmDialog = inject(ConfirmDialogServiceService);

  paginatedBrands$: Observable<Brand[]> = this.store.select(
    selectPaginatedBrands,
  );
  isLoading$: Observable<boolean> = this.store.select(selectBrandLoading);
  totalRecords$: Observable<number> = this.store.select(
    selectBrandTotalRecords,
  );

  searchControl = new FormControl('', { nonNullable: true });
  private destroy$ = new Subject<void>();

  private currentPage = 0;
  private pageSize = 10;
  
  // Local state tracking
  private currentBrandsLength = 0;
  private totalRecordsCount = 0;
  private isLoadingValue = false;
  showHeaderFilter: boolean = true;

  columns: TableColumn[] = [
    { key: 'name', label: 'Brand Name', filterable: true},
    { key: 'description', label: 'Description'},
    { key: 'numberOfProducts', label: 'Total Products', filterable: true },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      tooltip: 'Edit Brand',
    },
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete Brand',
    },
  ];

  ngOnInit(): void {
    this.initSubscriptions();
    this.loadBrand(this.currentPage, this.pageSize, '');
    this.setupSeachControl();
  }

  // Track store state locally
  private initSubscriptions(): void {
    this.paginatedBrands$.pipe(takeUntil(this.destroy$)).subscribe((brands) => {
      this.currentBrandsLength = brands?.length || 0;
    });

    this.totalRecords$.pipe(takeUntil(this.destroy$)).subscribe((total) => {
      this.totalRecordsCount = total || 0;
    });

    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isLoadingValue = loading;
    });
  }

  private setupSeachControl(): void {
    this.searchControl.valueChanges
      .pipe(
        map((searchTerm) => searchTerm.trim()),
        distinctUntilChanged(),
        debounceTime(300),
        takeUntil(this.destroy$),
      )
      .subscribe((searchTerm) => {
        this.currentPage = 0;
        this.loadBrand(this.currentPage, this.pageSize, searchTerm);
      });
  }

  handleTableAction(event: TableActionEvent): void {
    const brand = event.row as Brand;
    if (event.action === 'edit') {
      this.openBrandDialog(brand);
    } else if (event.action === 'delete') {
      this.deleteBrand(brand.id);
    }
  }

  onTableScroll(): void {
    if (!this.isLoadingValue && this.currentBrandsLength < this.totalRecordsCount) {
      this.currentPage++;
      const currentSearch = this.searchControl.value.trim();
      this.loadBrand(this.currentPage, this.pageSize, currentSearch);
    }
  }

  resetSearch(): void {
    this.searchControl.setValue('');
  }

  private loadBrand(pageIndex: number, pageSize: number, search: string): void {
    this.store.dispatch(
      BrandActions.loadPaginatedBrands({
        pageNumber: pageIndex + 1,
        pageSize,
        search: search.trim() !== '' ? search.trim() : undefined,
      }),
    );
  }

  openBrandDialog(brand?: Brand): void {
    const isEdit = !!brand;
    const dialogRef = this.matDialog.open(BrandCategoryDialogComponent, {
      width: '500px',
      data: {
        title: isEdit ? 'Edit Brand' : 'Add Brand',
        type: 'Brand',
        isEdit: isEdit,
        initialData: brand
          ? { name: brand.name, description: brand.description }
          : null,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (isEdit && brand?.id) {
          this.updateBrand(brand.id, result);
        } else {
          this.createBrand(result);
        }
      }
    });
  }

  createBrand(payload: { name: string; description: string }): void {
    this.store.dispatch(BrandActions.createBrand({ brand: payload as Brand }));
  }

  updateBrand(
    id: string | number,
    payload: { name: string; description: string },
  ): void {
    this.store.dispatch(
      BrandActions.updateBrand({
        brandId: String(id),
        brand: payload as Brand,
      }),
    );
  }

  deleteBrand(brandId: string | number): void {
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this brand?',
        'Delete',
        'Cancel',
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(
            BrandActions.deleteBrand({ brandId: String(brandId) }),
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}