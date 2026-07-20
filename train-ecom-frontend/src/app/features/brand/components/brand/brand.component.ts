import { Component, OnInit, inject } from '@angular/core';
import { BrandService } from '../../../../core/services/brand.service';
import { MatDialog } from '@angular/material/dialog';
import { Brand } from '../../../../core/models/product.model';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  private brandService = inject(BrandService);
  private matDialog = inject(MatDialog);
  private notification = inject(NotificationService);

  brands: Brand[] = [];

  ngOnInit(): void {
    this.fetchAllBrands();
  }

  fetchAllBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (data: Brand[]) => {
        this.brands = data;
      },
      error: () => {
        this.notification.showError('Failed to fetch brands. Please try again later.');
      },
    });
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
      this.fetchAllBrands();
    });
  }

  updateBrand(id: string, payload: { name: string; description: string }): void {
    this.brandService.updateBrand(id, payload).subscribe(() => {
      this.notification.showSuccess('Brand updated successfully!');
      this.fetchAllBrands();
    });
  }

  deleteBrand(brandId: string): void {
    if (confirm('Are you sure you want to delete this brand?')) {
      this.brandService.deleteBrand(brandId).subscribe({
        next: () => {
          this.notification.showSuccess('Brand deleted successfully.');
          this.fetchAllBrands();
        },
        error: () => {
          this.notification.showError('Failed to delete brand. Please try again later.');
        },
      });
    }
  }
}