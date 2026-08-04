import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Brand } from '../../../../core/models/brand.model';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
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
import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { startWith, map, distinctUntilChanged, debounceTime, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  private matDialog = inject(MatDialog);
  private store = inject(Store);
  private confirmDialog = inject(ConfirmDialogServiceService);

  paginatedBrands$: Observable<Brand[]> = this.store.select(selectPaginatedBrands);
  isLoading$: Observable<boolean> = this.store.select(selectBrandLoading);
  totalRecords$: Observable<number> = this.store.select(selectBrandTotalRecords);

  searchControl = new FormControl('');
  pageIndex$ = new BehaviorSubject<number>(0);
  pageSize$ = new BehaviorSubject<number>(10);

  private destroy$ = new Subject<void>();

  filteredBrands$!: Observable<Brand[]>;

  columns: TableColumn[] = [
    { key: 'name', label: 'Brand Name' },
    { key: 'description', label: 'Description' },
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

  handleTableAction(event: TableActionEvent): void {
    const brand = event.row as Brand;
    if (event.action === 'edit') {
      this.openBrandDialog(brand);
    } else if (event.action === 'delete') {
      this.deleteBrand(brand.id);
    }
  }

  ngOnInit(): void {
    this.loadPage();

    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((searchTerm) => {
      this.pageIndex$.next(0);
      this.loadPage(0, this.pageSize$.value, searchTerm || '');
    });

  }

  handlePageChange(event: PageEvent): void {
    this.pageIndex$.next(event.pageIndex);
    this.pageSize$.next(event.pageSize);
    const currentSearch = this.searchControl.value || '';
    this.loadPage(event.pageIndex, event.pageSize, currentSearch);
  }

  private loadPage(pageIndex = this.pageIndex$.value,
    pageSize = this.pageSize$.value,
    search = this.searchControl.value || ''): void {
    this.store.dispatch(BrandActions.loadPaginatedBrands({
      pageNumber: pageIndex + 1,
      pageSize,
      search: search.trim() !== '' ? search.trim() : undefined
    }));
  }

  openBrandDialog(brand?: Brand): void {
    const isEdit = !!brand;
    const dialogRef = this.matDialog.open(GenericDialogComponent, {
      width: '500px',
      data: {
        title: isEdit ? 'Edit Brand' : 'Add Brand',
        fields: this.getBrandFormFields(brand),
        submitButtonText: isEdit ? 'Update' : 'Add',
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

  private getBrandFormFields(brand?: Brand) {
    return [
      {
        key: 'name',
        label: 'Brand Name',
        type: 'text',
        value: brand?.name || '',
        required: true,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        value: brand?.description || '',
        required: true,
      },
    ];
  }

  createBrand(payload: { name: string; description: string }): void {
    this.store.dispatch(BrandActions.createBrand({ brand: payload as Brand }));
  }

  updateBrand(
    id: string,
    payload: { name: string; description: string }
  ): void {
    this.store.dispatch(
      BrandActions.updateBrand({ brandId: id, brand: payload as Brand })
    );
  }

  deleteBrand(brandId: string): void {
    this.confirmDialog.confirm('Are you sure you want to delete this brand?', 'Delete', 'Cancel').subscribe((confirmed) => {
      debugger;
      if (confirmed) {
        this.store.dispatch(BrandActions.deleteBrand({ brandId: brandId }));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
