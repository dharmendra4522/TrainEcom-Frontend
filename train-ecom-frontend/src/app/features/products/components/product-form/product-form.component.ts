import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';

import { Product, ProductImage } from '../../../../core/models/product.model';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { selectProductById } from '../../../../core/store/product/product.selectors';
import { Observable, combineLatest, Subject } from 'rxjs';
import { startWith, map, filter, take, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private matDialog = inject(MatDialog);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private actions$ = inject(Actions);
  private destroy$ = new Subject<void>();

  brandControl = new FormControl('');
  categoryControl = new FormControl('');
  filteredBrands!: Observable<Brand[]>;
  filteredCategories!: Observable<Category[]>;

  isEditMode: boolean = false;
  productId: string | null = null;
  originalBrandId: string = '';
  originalCategoryId: string = '';
  originalBrandName: string = '';
  originalCategoryName: string = '';

  productForm!: FormGroup;
  brands: Brand[] = [];
  categories: Category[] = [];
  selectFiles: File[] = [];
  existingImages: { id: string; imageUrl: string }[] = [];
  deletedImageIds: string[] = [];

  ngOnInit(): void {
    this.initFormAndData();
    this.initAutocomplete();
    this.initListeners();
    this.checkRouteForEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

      combineLatest([
        this.store.select(selectAllBrands),
        this.store.select(selectAllCategories),
      ])
        .pipe(
          filter(
            ([brands, categories]) =>
              brands &&
              brands.length > 0 &&
              categories &&
              categories.length > 0,
          ),
          takeUntil(this.destroy$),
          take(1),
        )
        .subscribe({
          next: ([brands, categories]) => {
            this.brands = brands;
            this.categories = categories;
            if (this.productId) {
              this.loadProductDetails(this.productId);
            }
          },
        });
    }
  }

  private loadProductDetails(productId: string): void {
    this.store.dispatch(ProductActions.loadProductById({ id: productId }));

    this.store
      .select(selectProductById(productId))
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        if (product) {
          const brandId = product.brandId || '';
          const categoryId = product.categoryId || '';

          this.originalBrandId = brandId;
          this.originalCategoryId = categoryId;
          this.originalBrandName = product.brandName || '';
          this.originalCategoryName = product.categoryName || '';

          this.productForm.patchValue({
            title: product.name || '',
            price: product.price ?? 0,
            stockQuantity: product.stockQuantity ?? 0,
            brand: brandId,
            category: categoryId,
            description: product.description || '',
          });

          if (brandId) {
            this.brandControl.setValue(brandId);
          }
          if (categoryId) {
            this.categoryControl.setValue(categoryId);
          }

          if (product.images) {
            this.existingImages = product.images.map((img: ProductImage) => ({
              id: img.id,
              imageUrl: img.imageUrl,
            }));
          }
        }
      });
  }

  removeExistingImage(imageId: string, index: number) {
    this.deletedImageIds.push(imageId);
    this.existingImages.splice(index, 1);
  }

  private initAutocomplete(): void {
    this.filteredBrands = this.brandControl.valueChanges.pipe(
      startWith(this.brandControl.value || ''),
      map((val) => this.resolveFilter(val, this.brands)),
    );

    this.filteredCategories = this.categoryControl.valueChanges.pipe(
      startWith(this.categoryControl.value || ''),
      map((val) => this.resolveFilter(val, this.categories)),
    );
  }

  triggerBrandFilter(): void {
    this.brandControl.setValue(this.brandControl.value);
  }

  triggerCategoryFilter(): void {
    this.categoryControl.setValue(this.categoryControl.value);
  }

  private initListeners(): void {
    this.brandControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (!val) {
          this.productForm.patchValue({ brand: '' });
          return;
        }

        if (
          this.brands.length === 0 ||
          (typeof val === 'string' &&
            val.toLowerCase() === this.originalBrandId.toLowerCase())
        ) {
          this.productForm.patchValue({ brand: val });
          return;
        }

        if (typeof val === 'string') {
          const foundById = this.brands.find(
            (b) => b.id.toLowerCase() === val.toLowerCase(),
          );
          if (foundById) {
            this.productForm.patchValue({ brand: foundById.id });
          } else {
            const foundByName = this.brands.find(
              (b) => b.name.toLowerCase() === val.toLowerCase(),
            );
            if (foundByName) {
              this.productForm.patchValue({ brand: foundByName.id });
            } else {
              this.productForm.patchValue({ brand: '' });
            }
          }
        }
      });

    this.categoryControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (!val) {
          this.productForm.patchValue({ category: '' });
          return;
        }

        if (
          this.categories.length === 0 ||
          (typeof val === 'string' &&
            val.toLowerCase() === this.originalCategoryId.toLowerCase())
        ) {
          this.productForm.patchValue({ category: val });
          return;
        }

        if (typeof val === 'string') {
          const foundById = this.categories.find(
            (c) => c.id.toLowerCase() === val.toLowerCase(),
          );
          if (foundById) {
            this.productForm.patchValue({ category: foundById.id });
          } else {
            const foundByName = this.categories.find(
              (c) => c.name.toLowerCase() === val.toLowerCase(),
            );
            if (foundByName) {
              this.productForm.patchValue({ category: foundByName.id });
            } else {
              this.productForm.patchValue({ category: '' });
            }
          }
        }
      });
  }

  private resolveFilter<T extends { id: string; name: string }>(
    value: string | T | null,
    items: T[],
  ): T[] {
    if (!value) return items;
    const strVal = typeof value === 'string' ? value : value.name;
    if (!strVal) return items;

    const isExistingId = items.some(
      (item) => item.id.toLowerCase() === strVal.toLowerCase(),
    );
    if (isExistingId) {
      return items;
    }

    const query = strVal.toLowerCase().trim();
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }

  onBrandSelected(event: { option: { value: string } }): void {
    this.productForm.patchValue({ brand: event.option.value });
  }

  onCategorySelected(event: { option: { value: string } }): void {
    this.productForm.patchValue({ category: event.option.value });
  }

  displayBrandName = (brandId: string): string => {
    if (!brandId) return '';
    const brand = this.brands.find(
      (b) => b.id.toLowerCase() === brandId.toLowerCase(),
    );
    if (brand) return brand.name;
    if (brandId.toLowerCase() === this.originalBrandId.toLowerCase())
      return this.originalBrandName;
    return brandId;
  };

  displayCategoryName = (categoryId: string): string => {
    if (!categoryId) return '';
    const category = this.categories.find(
      (c) => c.id.toLowerCase() === categoryId.toLowerCase(),
    );
    if (category) return category.name;
    if (categoryId.toLowerCase() === this.originalCategoryId.toLowerCase())
      return this.originalCategoryName;
    return categoryId;
  };

  openAddDialog(type: 'brand' | 'category'): void {
    const title = `Add new ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    this.matDialog
      .open(GenericDialogComponent, {
        width: '400px',
        data: {
          title,
          fields: [
            { key: 'name', label: `${type} Name`, type: 'text' },
            { key: 'description', label: 'Description', type: 'text' },
          ],
          submitButtonText: 'Save',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.handleDialogSubmit(type, result);
      });
  }

  private handleDialogSubmit(
    type: 'brand' | 'category',
    result: { name: string; description?: string },
  ): void {
    const payload = {
      name: result.name,
      description: result.description ?? '',
    };
    if (type === 'brand') {
      this.actions$
        .pipe(
          ofType(BrandActions.createBrandSuccess),
          takeUntil(this.destroy$),
          take(1),
        )
        .subscribe(({ brand }) => {
          this.productForm.patchValue({ brand: brand.id });
          this.brandControl.setValue(brand.id);
        });

      this.store.dispatch(
        BrandActions.createBrand({ brand: payload as Brand }),
      );
    } else {
      this.actions$
        .pipe(
          ofType(CategoryActions.createCategorySuccess),
          takeUntil(this.destroy$),
          take(1),
        )
        .subscribe(({ category }) => {
          this.productForm.patchValue({ category: category.id });
          this.categoryControl.setValue(category.id);
        });

      this.store.dispatch(
        CategoryActions.createCategory({ category: payload as Category }),
      );
    }
  }

  private validateForm(): void {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0, [Validators.min(0)]],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      images: this.fb.array([this.fb.control('')]),
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
      const file = input.files[0];
      const maxSizeBytes = 5 * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        this.notification.showError(
          `File "${file.name}" exceeds 5MB. Please upload an image less than 5MB.`,
          'Close',
        );
        input.value = '';
        delete this.selectFiles[index];
        return;
      }

      this.selectFiles[index] = file;
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
        stockQuantity:
          formValue.stockQuantity !== null &&
          formValue.stockQuantity !== undefined &&
          formValue.stockQuantity !== ''
            ? Number(formValue.stockQuantity)
            : 0,
        brandId: formValue.brand,
        categoryId: formValue.category,
      };

      if (this.isEditMode && this.productId) {
        this.store.dispatch(
          ProductActions.updateProduct({
            id: this.productId,
            productData: productPayload,
            newFiles: this.selectFiles,
            deletedImageIds: this.deletedImageIds,
          }),
        );
      } else {
        this.store.dispatch(
          ProductActions.createProduct({
            productData: productPayload,
            files: this.selectFiles,
          }),
        );
      }
    } else {
      this.notification.showError('Please fill all required fields', 'Close');
    }
  }

  fetchAllBrands(): void {
    this.store.dispatch(BrandActions.loadBrands());
    this.store
      .select(selectAllBrands)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Brand[]) => {
          if (data) {
            this.brands = data;
            if (this.brandControl.value) {
              this.brandControl.setValue(this.brandControl.value);
            }
          }
        },
        error: (error: unknown) =>
          console.error('Error fetching brands:', error),
      });
  }

  fetchAllCategories(): void {
    this.store.dispatch(CategoryActions.loadCategories());
    this.store
      .select(selectAllCategories)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Category[]) => {
          if (data) {
            this.categories = data;
            if (this.categoryControl.value) {
              this.categoryControl.setValue(this.categoryControl.value);
            }
          }
        },
        error: (error: unknown) =>
          console.error('Error fetching categories:', error),
      });
  }
}
