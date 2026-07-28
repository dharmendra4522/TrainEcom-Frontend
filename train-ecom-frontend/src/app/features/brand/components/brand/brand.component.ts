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
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { startWith, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  private matDialog = inject(MatDialog);
  private store = inject(Store);

  paginatedBrands$: Observable<Brand[]> = this.store.select(selectPaginatedBrands);
  isLoading$: Observable<boolean> = this.store.select(selectBrandLoading);
  totalRecords$: Observable<number> = this.store.select(selectBrandTotalRecords);

  searchControl = new FormControl('');
  pageIndex$ = new BehaviorSubject<number>(0);
  pageSize$ = new BehaviorSubject<number>(10);

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

  handleTableAction(event: TableActionEvent<Brand>): void {
    if (event.action === 'edit') {
      this.openBrandDialog(event.row);
    } else if (event.action === 'delete') {
      this.deleteBrand(event.row.id);
    }
  }

  ngOnInit(): void {
    this.loadPage();

    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );

    this.filteredBrands$ = combineLatest([this.paginatedBrands$, search$]).pipe(
      map(([brands, search]) => {
        const query = (search || '').toLowerCase().trim();
        if (!query) return brands;
        return (brands || []).filter(
          (b) =>
            (b.name || '').toLowerCase().includes(query) ||
            (b.description || '').toLowerCase().includes(query)
        );
      })
    );

  }

  handlePageChange(event: PageEvent): void {
    this.pageIndex$.next(event.pageIndex);
    this.pageSize$.next(event.pageSize);
    this.loadPage(event.pageIndex, event.pageSize);
  }

  private loadPage(pageIndex = this.pageIndex$.value, pageSize = this.pageSize$.value): void {
    this.store.dispatch(BrandActions.loadPaginatedBrands({
      pageNumber: pageIndex + 1,
      pageSize,
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
    if (confirm('Are you sure you want to delete this brand?')) {
      this.store.dispatch(BrandActions.deleteBrand({ brandId: brandId }));
    }
  }
}
