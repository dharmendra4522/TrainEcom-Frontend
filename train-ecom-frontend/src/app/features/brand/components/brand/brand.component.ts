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
  selectAllBrands,
  selectBrandLoading,
} from '../../../../core/store/brand/brand.selectors';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { startWith, map, distinctUntilChanged, debounceTime, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  private matDialog = inject(MatDialog);
  private store = inject(Store);

  allBrands$: Observable<Brand[]> = this.store.select(selectAllBrands);
  isLoading$: Observable<boolean> = this.store.select(selectBrandLoading);

  searchControl = new FormControl('');
  pageIndex$ = new BehaviorSubject<number>(0);
  pageSize$ = new BehaviorSubject<number>(10);

  pagedBrands$!: Observable<Brand[]>;
  filteredTotalCount$!: Observable<number>;

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
    this.store.select(selectAllBrands).pipe(take(1)).subscribe((brands) => {
      if (!brands || brands.length === 0) {
        this.store.dispatch(BrandActions.loadBrands());
      }
    });

    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );

    const filteredBrands$ = combineLatest([this.allBrands$, search$]).pipe(
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

    this.filteredTotalCount$ = filteredBrands$.pipe(
      map((brands) => (brands || []).length)
    );

    this.pagedBrands$ = combineLatest([
      filteredBrands$,
      this.pageIndex$,
      this.pageSize$,
    ]).pipe(
      map(([brands, pageIndex, pageSize]) => {
        const start = pageIndex * pageSize;
        return (brands || []).slice(start, start + pageSize);
      })
    );

    search$.subscribe(() => {
      this.pageIndex$.next(0);
    });
  }

  handlePageChange(event: PageEvent): void {
    this.pageIndex$.next(event.pageIndex);
    this.pageSize$.next(event.pageSize);
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
