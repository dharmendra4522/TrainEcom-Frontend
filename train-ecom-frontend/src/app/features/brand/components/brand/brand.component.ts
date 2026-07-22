import { Component, OnInit, inject } from '@angular/core';
import { BrandService } from '../../../../core/services/brand.service';
import { MatDialog } from '@angular/material/dialog';
import { Brand } from '../../../../core/models/product.model';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Store } from '@ngrx/store';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import { selectAllBrands, selectBrandLoading } from '../../../../core/store/brand/brand.selectors';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  private brandService = inject(BrandService);
  private matDialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private store = inject(Store);

  brands$: Observable<Brand[]> = this.store.select(selectAllBrands);
  isLoading$: Observable<boolean> = this.store.select(selectBrandLoading);

  columns: TableColumn[] = [
    { key: 'name', label: 'Brand Name' },
    { key: 'description', label: 'Description' }
  ];

  actions: TableAction[] = [
    { actionKey: 'edit', icon: 'edit', color: 'primary', tooltip: 'Edit Brand' },
    { actionKey: 'delete', icon: 'delete', color: 'warn', tooltip: 'Delete Brand' }
  ];

  handleTableAction(event: TableActionEvent<Brand>): void {
    if (event.action === 'edit') {
      this.openBrandDialog(event.row);
    } else if (event.action === 'delete') {
      this.deleteBrand(event.row.id);
    }
  }

  ngOnInit(): void {
    this.fetchAllBrands();
  }


  fetchAllBrands(): void {
    this.store.dispatch(BrandActions.loadBrands());
  }

  openBrandDialog(brand?: Brand): void {
    const isEdit = !!brand;
    const dialogRef = this.matDialog.open(GenericDialogComponent, {
      width: '500px',
      data: {
        title: isEdit ? 'Edit Brand' : 'Add Brand',
        fields: this.getBrandFormFields(brand),
        submitButtonText: isEdit ? 'Update' : 'Add'
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
      { key: 'name', label: 'Brand Name', type: 'text', value: brand?.name || '', required: true },
      { key: 'description', label: 'Description', type: 'text', value: brand?.description || '', required: true },
    ];
  }

  createBrand(payload: { name: string; description: string }): void {
    this.brandService.createBrand(payload).subscribe(() => {
      this.notification.showSuccess('Brand created successfully.');
      this.store.dispatch(BrandActions.loadBrands());
    });
  }

  updateBrand(id: string, payload: { name: string; description: string }): void {
    this.brandService.updateBrand(id, payload).subscribe(() => {
      this.notification.showSuccess('Brand updated successfully!');
      this.store.dispatch(BrandActions.loadBrands());
    });
  }

  deleteBrand(brandId: string): void {
    if (confirm('Are you sure you want to delete this brand?')) {
      this.brandService.deleteBrand(brandId).subscribe({
        next: () => {
          this.notification.showSuccess('Brand deleted successfully.');
          this.store.dispatch(BrandActions.loadBrands());
        },
        error: () => {
          this.notification.showError('Failed to delete brand. Please try again later.');
        },
      });
    }
  }
}