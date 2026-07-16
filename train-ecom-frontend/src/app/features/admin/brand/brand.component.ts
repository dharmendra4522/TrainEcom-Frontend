import { Component, inject } from '@angular/core';
import { BrandService } from '../../../core/services/brand.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Brand } from '../../../core/models/product.model';
import { GenericDialogComponent } from '../../../shared/components/generic-dialog/generic-dialog.component';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent {
  private brandService = inject(BrandService);
  private matDialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  brands: Brand[] = [];
  isLoading: boolean = false;

  ngOnInit() {
    this.fetchAllBrands();
  }

  fetchAllBrands() {
    this.isLoading = true;
    this.brandService.getAllBrands().subscribe({
      next: (data: Brand[]) => {
        this.brands = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          'Failed to fetch brands. Please try again later.',
          'Close',
          {
            duration: 3000,
          },
        );
      },
    });
  }

  openBrandDialog(brand?: Brand) {
    const isEdit = !!brand;
    const dialogRef = this.matDialog.open(GenericDialogComponent, {
      width: '400px',
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

  createBrand(payload: { name: string; description: string }) {
    this.brandService.createBrand(payload).subscribe(() => {
      this.snackBar.open('Brand created successfully.', 'Close', {
        duration: 3000,
      });
      this.fetchAllBrands();
    });
  }

  updateBrand(id: string, payload: any) {
    this.brandService.updateBrand(id, payload).subscribe(() => {
      this.snackBar.open('Brand updated successfully!', 'Close', {
        duration: 3000,
      });
      this.fetchAllBrands();
    });
  }

  deleteBrand(brandId: string) {
    if (confirm('Are you sure you want to delete this brand?')) {
      this.brandService.deleteBrand(brandId).subscribe({
        next: () => {
          this.snackBar.open('Brand deleted successfully.', 'Close', {
            duration: 3000,
          });
          this.fetchAllBrands();
        },
        error: (error) => {
          this.snackBar.open(
            'Failed to delete brand. Please try again later.',
            'Close',
            {
              duration: 3000,
            },
          );
        },
      });
    }
  }
}
