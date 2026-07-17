import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { BrandService } from '../../../../core/services/brand.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Brand, Category } from '../../../../core/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);
  private productService = inject(ProductService);
  private matDialog = inject(MatDialog);
  private router = inject(Router);

  brandControl = new FormControl('');
  categoryControl = new FormControl('');
  filteredBrands!: Observable<Brand[]>;
  filteredCategories!: Observable<Category[]>;

  productForm!: FormGroup;
  brands: Brand[] = [];
  categories: Category[] = [];
  selectFiles: File[] = [];

  ngOnInit() {
    this.validateForm();
    this.fetchAllBrands();
    this.fetchAllCategories();
    this.filteredBrands = this.brandControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterBrands(value || ''))
    );

    this.filteredCategories = this.categoryControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterCategories(value || ''))
    );

    this.brandControl.valueChanges.subscribe(val => {
      if (!val) this.productForm.patchValue({ brand: '' });
    });
  }

  private filterBrands(value: string): Brand[] {
    const filterValue = value.toLowerCase();
    return this.brands.filter(brand => brand.name.toLowerCase().includes(filterValue));
  }

  private filterCategories(value: string): Category[] {
    const filterValue = value.toLowerCase();
    return this.categories.filter(category => category.name.toLowerCase().includes(filterValue));
  }

  onBrandSelected(event: any): void {
    this.productForm.patchValue({ brand: event.option.value });
  }

  onCategorySelected(event: any): void {
    this.productForm.patchValue({ category: event.option.value });
  }

  displayBrandName(brandId: string): string {
    if (!brandId) return '';
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : '';
  }

  displayCategoryName(categoryId: string): string {
    if (!categoryId) return '';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  openAddDialog(type: 'brand' | 'category'): void {
    const title = `Add new ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    this.matDialog.open(GenericDialogComponent, {
      width: '400px',
      data: {
        title: title,
        fields: [{ key: 'name', label: `${type} Name`, type: 'text' }],
        submitButtonText: 'Save'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        const service = (type === 'brand') ? this.brandService.createBrand(result) : this.categoryService.createCategory(result);

        service.subscribe({
          next: (response) => {
            if (type === 'brand') {
              this.brands.push(response as Brand);
              this.productForm.patchValue({ brand: response.id });
              this.brandControl.setValue(response.id);
            } else {
              this.categories.push(response as Category);
              this.productForm.patchValue({ category: response.id });
              this.categoryControl.setValue(response.id);
            }

            this.notification.showSuccess(`${type} added successfully`, 'Close');

          },
          error: (error) => {
            console.error(`Error adding ${type}:`, error);
            this.notification.showError(`Error adding ${type}`, 'Close');
          }
        })
      }
    })
  }

  private validateForm() {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: [0, Validators.required],
      stock: [0, Validators.required],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      images: this.fb.array([this.fb.control('')])
    })
  }

  get imageControls() {
    return (this.productForm.get('images') as FormArray).controls;
  }

  addImageField(): void {
    const imagesArray = this.productForm.get('images') as FormArray;
    imagesArray.push(this.fb.control(''));
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectFiles[index] = file;
    }
  }

  removeImageField(index: number): void {
    const imagesArray = this.productForm.get('images') as FormArray;
    imagesArray.removeAt(index);
    this.selectFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.productService.createProduct(this.productForm.value, this.selectFiles).subscribe({
        next: (response) => {
          console.log('Product created successfully:', response);
          this.notification.showSuccess('Product created successfully', 'Close');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.notification.showError('Error creating product', 'Close');
        }
      });
    }
    else {
      this.notification.showError('Please fill all required fields', 'Close');
    }
  }

  fetchAllBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (data: Brand[]) => {
        this.brands = data;
        console.log('Brands fetched successfully:', this.brands);
      },
      error: (error: any) => {
        console.error('Error fetching brands:', error);
        this.notification.showError('Error fetching brands');
      }
    });
  }

  fetchAllCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        console.log('Categories fetched successfully:', this.categories);
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
        this.notification.showError('Error fetching categories');
      }
    });
  }

}
