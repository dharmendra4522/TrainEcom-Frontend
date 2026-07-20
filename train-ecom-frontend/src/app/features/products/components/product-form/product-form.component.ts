import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { BrandService } from '../../../../core/services/brand.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Brand, Category } from '../../../../core/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductService } from '../../../../core/services/product.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
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
  private route = inject(ActivatedRoute);

  brandControl = new FormControl('');
  categoryControl = new FormControl('');
  filteredBrands!: Observable<Brand[]>;
  filteredCategories!: Observable<Category[]>;

  isEditMode: boolean = false;
  productId: string | null = null;

  productForm!: FormGroup;
  brands: Brand[] = [];
  categories: Category[] = [];
  selectFiles: File[] = [];
  existingImages: { id: string, imageUrl: string }[] = [];
  deletedImageIds: string[] = [];

  ngOnInit(): void {
    this.initFormAndData();
    this.initAutocomplete();
    this.initListeners();
    this.checkRouteForEditMode();
  }

  // Initialization Helpers
  private initFormAndData(): void {
    this.validateForm();
    this.fetchAllBrands();
    this.fetchAllCategories();
  }

  checkRouteForEditMode(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProductDetails(this.productId);
    }
  }

  private loadProductDetails(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          title: product.name,
          price: product.price,
          stockQuantity: product.stockQuantity,
          brand: product.brandId,
          category: product.categoryId,
          description: product.description
        });

        if (product.brandId) {
          this.brandControl.setValue(product.brandId);
        }
        if (product.categoryId) {
          this.categoryControl.setValue(product.categoryId);
        }

        if (product.images) {
          this.existingImages = product.images.map(img => ({
            id: img.id,
            imageUrl: img.imageUrl
          }));
        }
      },
      error: (error: unknown) => {
        console.error('Error fetching product details:', error);
        this.notification.showError('Error fetching product details', 'Close');
      }
    });
  }

  removeExistingImage(imageId: string, index: number) {
    this.deletedImageIds.push(imageId);
    this.existingImages.splice(index, 1);
  }


  private initAutocomplete(): void {
    this.filteredBrands = this.brandControl.valueChanges.pipe(
      startWith(''),
      map(val => this.resolveFilter(val, this.brands, (b, name) => b.name.toLowerCase().includes(name)))
    );

    this.filteredCategories = this.categoryControl.valueChanges.pipe(
      startWith(''),
      map(val => this.resolveFilter(val, this.categories, (c, name) => c.name.toLowerCase().includes(name)))
    );
  }

  private initListeners(): void {
    this.brandControl.valueChanges.subscribe(val => {
      if (!val) this.productForm.patchValue({ brand: '' });
    });
  }

  private resolveFilter<T extends { name: string }>(
    value: string | T | null,
    items: T[],
    matcher: (item: T, name: string) => boolean
  ): T[] {
    const name = typeof value === 'string' ? value : (value?.name ?? '');
    if (!name) return items;
    return items.filter(item => matcher(item, name.toLowerCase()));
  }


  onBrandSelected(event: { option: { value: string } }): void {
    this.productForm.patchValue({ brand: event.option.value });
  }

  onCategorySelected(event: { option: { value: string } }): void {
    this.productForm.patchValue({ category: event.option.value });
  }

  displayBrandName(brandId: string): string {
    return this.brands.find(b => b.id === brandId)?.name ?? '';
  }

  displayCategoryName(categoryId: string): string {
    return this.categories.find(c => c.id === categoryId)?.name ?? '';
  }


  openAddDialog(type: 'brand' | 'category'): void {
    const title = `Add new ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    this.matDialog.open(GenericDialogComponent, {
      width: '400px',
      data: {
        title,
        fields: [
          { key: 'name', label: `${type} Name`, type: 'text' },
          { key: 'description', label: 'Description', type: 'text' }
        ],
        submitButtonText: 'Save'
      }
    }).afterClosed().subscribe(result => {
      if (result) this.handleDialogSubmit(type, result);
    });
  }

  private handleDialogSubmit(type: 'brand' | 'category', result: { name: string; description?: string }): void {
    const payload = {
      name: result.name,
      description: result.description ?? ''
    };

    const service = type === 'brand'
      ? this.brandService.createBrand(payload)
      : this.categoryService.createCategory(payload);

    service.subscribe({
      next: (response) => {
        if (type === 'brand') {
          const brand = response as Brand;
          this.brands.push(brand);
          this.productForm.patchValue({ brand: brand.id });
          this.brandControl.setValue(brand.id);
        } else {
          const category = response as Category;
          this.categories.push(category);
          this.productForm.patchValue({ category: category.id });
          this.categoryControl.setValue(category.id);
        }
        this.notification.showSuccess(`${type} added successfully`, 'Close');
      },
      error: (error) => {
        console.error(`Error adding ${type}:`, error);
        this.notification.showError(`Error adding ${type}`, 'Close');
      }
    });
  }


  private validateForm(): void {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: [0, Validators.required],
      stockQuantity: [0, Validators.required],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      images: this.fb.array([this.fb.control('')])
    });
  }

  get imageControls() {
    return (this.productForm.get('images') as FormArray).controls;
  }

  addImageField(): void {
    (this.productForm.get('images') as FormArray).push(this.fb.control(''));
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectFiles[index] = input.files[0];
    }
  }

  removeImageField(index: number): void {
    (this.productForm.get('images') as FormArray).removeAt(index);
    this.selectFiles.splice(index, 1);
  }


  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      const productPayload: Partial<Product> = {
        name: formValue.title,
        description: formValue.description,
        price: formValue.price,
        stockQuantity: formValue.stockQuantity,
        brandId: formValue.brand,
        categoryId: formValue.category
      };

      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(this.productId, productPayload, this.selectFiles, this.deletedImageIds).subscribe({
          next: () => {
            this.notification.showSuccess('Product updated successfully', 'Close');
            this.router.navigate(['/admin/products']);
          },
          error: (error: unknown) => {
            console.error('Error updating product:', error);
            this.notification.showError('Error updating product', 'Close');
          }
        });
      } else {
        this.productService.createProduct(productPayload, this.selectFiles).subscribe({
          next: () => {
            this.notification.showSuccess('Product created successfully', 'Close');
            this.router.navigate(['/admin/products']);
          },
          error: (error: unknown) => {
            console.error('Error creating product:', error);
            this.notification.showError('Error creating product', 'Close');
          }
        });
      }
    } else {
      this.notification.showError('Please fill all required fields', 'Close');
    }
  }

  fetchAllBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (data: Brand[]) => this.brands = data,
      error: (error: unknown) => console.error('Error fetching brands:', error)
    });
  }

  fetchAllCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: Category[]) => this.categories = data,
      error: (error: unknown) => console.error('Error fetching categories:', error)
    });
  }
}