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
import { selectProductById, selectProductsLoading } from '../../../../core/store/product/product.selectors';
import { Observable, combineLatest, Subject } from 'rxjs';
import { startWith, map, filter, take, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { BrandCategoryDialogComponent } from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';
import { ManageEntityDialogComponent } from '../../../../shared/components/manage-entity-dialog/manage-entity-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import * as BrandActions from '../../../../core/store/brand/brand.action';
import { selectAllBrands } from '../../../../core/store/brand/brand.selectors';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { Location } from '@angular/common';

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
  private location = inject(Location);

  brandControl = new FormControl<string>('');
  categoryControl = new FormControl<string>('');

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
  previewUrls: (string | null)[] = [];
  existingImages: { id: string; imageUrl: string }[] = [];
  deletedImageIds: string[] = [];
  isLoading$: Observable<boolean> = this.store.select(selectProductsLoading);

  // Lifecycle hook to initialize component data and setup subscriptions.
  ngOnInit(): void {
    this.initFormAndData();
    this.checkRouteForEditMode();
    this.setupPaginatedListeners();
  }

  // Lifecycle hook to cleanup object URLs and destroy subjects.
  ngOnDestroy(): void {
    this.revokeAllPreviewUrls();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initializes form controls and fetches initial master data.
  private initFormAndData(): void {
    this.validateForm();
    this.fetchAllBrands();
    this.fetchAllCategories();
  }

  // Sets up action listeners for paginated brand and category success events.
  private setupPaginatedListeners(): void {
    this.actions$
      .pipe(
        ofType(BrandActions.loadPaginatedBrandsSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(({ brands, pageNumber }: { brands: Brand[]; pageNumber: number }) => {
        if (pageNumber === 1) {
          this.brands = brands;
        }
      });

    this.actions$
      .pipe(
        ofType(CategoryActions.loadPaginatedCategoriesSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(({ categories, pageNumber }: { categories: Category[]; pageNumber: number }) => {
        if (pageNumber === 1) {
          this.categories = categories;
        }
      });
  }

  /**
   * Checks route parameters to determine if the component is in edit mode.
   */
  checkRouteForEditMode(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.waitForMasterDataAndLoadProduct();
    }
  }

  // Waits for store brands and categories to load before fetching product details for editing.
  private waitForMasterDataAndLoadProduct(): void {
    combineLatest([
      this.store.select(selectAllBrands),
      this.store.select(selectAllCategories),
    ])
      .pipe(
        filter(
          ([brands, categories]: [Brand[], Category[]]) =>
            brands &&
            brands.length > 0 &&
            categories &&
            categories.length > 0,
        ),
        takeUntil(this.destroy$),
        take(1),
      )
      .subscribe({
        next: ([brands, categories]: [Brand[], Category[]]) => {
          this.brands = brands;
          this.categories = categories;
          if (this.productId) {
            this.loadProductDetails(this.productId);
          }
        },
      });
  }

  // Dispatches action to load product details by ID and patches the form.
  private loadProductDetails(productId: string): void {
    this.store.dispatch(ProductActions.loadProductById({ id: productId }));

    this.store
      .select(selectProductById(productId))
      .pipe(takeUntil(this.destroy$))
      .subscribe((product: Product | undefined) => {
        if (product) {
          this.patchProductFormValues(product);
        }
      });
  }

  //  Patches form control values and metadata from loaded product object.
  private patchProductFormValues(product: Product): void {
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

    // check if brandId exists before setting the value to avoid null or undefined issues
    if (brandId) {
      this.brandControl.setValue(brandId);
      this.productForm.get('brand')?.setValue(brandId);
    }

    // check if categoryId exists before setting the value to avoid null or undefined issues
    if (categoryId) {
      this.categoryControl.setValue(categoryId);
      this.productForm.get('category')?.setValue(categoryId);
    }

    if (product.images) {
      this.existingImages = product.images.map((img: ProductImage) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      }));
    }
  }

  //Removes an existing image from the list and marks it for deletion.
  removeExistingImage(imageId: string, index: number): void {
    this.deletedImageIds.push(imageId);
    this.existingImages.splice(index, 1);
  }

  // Opens the manage entity dialog for adding/editing brands or categories.
  openManageDialog(type: 'Brand' | 'Category'): void {
    this.matDialog.open(ManageEntityDialogComponent, {
      width: '600px',
      data: { type },
      disableClose: true
    }).afterClosed().subscribe((newId: unknown) => {
      if (newId && typeof newId === 'string') {
        this.handleManageDialogClose(type, newId);
      }
    });
  }

  // Handles state synchronization after manage entity dialog is closed.
  private handleManageDialogClose(type: 'Brand' | 'Category', newId: string): void {
    if (type === 'Brand') {
      this.store.select(selectAllBrands).pipe(take(1)).subscribe((brands: Brand[]) => {
        this.brands = brands;
        this.productForm.get('brand')?.setValue(newId);
        this.brandControl.setValue(newId);
      });
    } else {
      this.store.select(selectAllCategories).pipe(take(1)).subscribe((categories: Category[]) => {
        this.categories = categories;
        this.productForm.get('category')?.setValue(newId);
        this.categoryControl.setValue(newId);
      });
    }
  }

  //  Opens the quick add dialog for brands or categories.
  openAddDialog(type: 'brand' | 'category'): void {
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const title = `Add new ${formattedType}`;
    this.matDialog
      .open(BrandCategoryDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title,
          type: formattedType,
          isEdit: false
        },
      })
      .afterClosed()
      .subscribe((result: { name: string; description?: string } | undefined) => {
        if (result) this.handleDialogSubmit(type, result);
      });
  }

  // Dispatches create action for brand or category based on dialog result.
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
        .subscribe(({ brand }: { brand: Brand }) => {
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
        .subscribe(({ category }: { category: Category }) => {
          this.productForm.patchValue({ category: category.id });
          this.categoryControl.setValue(category.id);
        });

      this.store.dispatch(
        CategoryActions.createCategory({ category: payload as Category }),
      );
    }
  }

  // Initializes the reactive product form group with validations.
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


  // Getter for image form array controls.
  get imageControls() {
    return (this.productForm.get('images') as FormArray).controls;
  }

  // Adds a new image input field to the form array.
  addImageField(): void {
    (this.productForm.get('images') as FormArray).push(this.fb.control(''));
    this.previewUrls.push(null);
  }

  //Handles image file selection, validation size limits, and object URL generation.
  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const maxSizeBytes = 5 * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        this.handleInvalidFileSize(file.name, input, index);
        return;
      }

      this.processValidFile(file, index);
    }
  }

  // Handles error state when uploaded file exceeds size limits.
  private handleInvalidFileSize(fileName: string, input: HTMLInputElement, index: number): void {
    this.notification.showError(
      `File "${fileName}" exceeds 5MB. Please upload an image less than 5MB.`,
      'Close',
    );
    input.value = '';
    if (this.previewUrls[index]) {
      URL.revokeObjectURL(this.previewUrls[index]!);
      this.previewUrls[index] = null;
    }
    delete this.selectFiles[index];
  }

  // Processes a valid file selection by updating preview URLs and file lists.
  private processValidFile(file: File, index: number): void {
    if (this.previewUrls[index]) {
      URL.revokeObjectURL(this.previewUrls[index]!);
    }
    this.selectFiles[index] = file;
    this.previewUrls[index] = URL.createObjectURL(file);
  }

  //  Removes an image input field from the form array and cleans up associated resources.
  removeImageField(index: number): void {
    (this.productForm.get('images') as FormArray).removeAt(index);
    if (this.previewUrls[index]) {
      URL.revokeObjectURL(this.previewUrls[index]!);
    }
    this.previewUrls.splice(index, 1);
    this.selectFiles.splice(index, 1);
  }


  // Revokes all object URLs created for image previews to free up memory.
  private revokeAllPreviewUrls(): void {
    this.previewUrls.forEach((url: string | null) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
  }

  // Submits the product form, dispatching create or update actions based on mode.
  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const cleanFiles = this.selectFiles.filter((f: File | undefined): f is File => !!f);

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
            newFiles: cleanFiles,
            deletedImageIds: this.deletedImageIds,
          }),
        );
      } else {
        this.store.dispatch(
          ProductActions.createProduct({
            productData: productPayload,
            files: cleanFiles,
          }),
        );
      }
    } else {
      this.notification.showError('Please fill all required fields', 'Close');
    }
  }

  // Fetches all brands from store or dispatches load action if empty.
  fetchAllBrands(): void {
    this.store
      .select(selectAllBrands)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Brand[]) => {
          if (data && data.length > 0) {
            this.brands = data;
            if (this.brandControl.value) {
              this.brandControl.setValue(this.brandControl.value);
            }
          } else {
            this.store.dispatch(BrandActions.loadBrands());
          }
        },
        error: (error: unknown) =>
          console.error('Error fetching brands:', error),
      });
  }

  // Fetches all categories from store or dispatches load action if empty.
  fetchAllCategories(): void {
    this.store
      .select(selectAllCategories)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Category[]) => {
          if (data && data.length > 0) {
            this.categories = data;
            if (this.categoryControl.value) {
              this.categoryControl.setValue(this.categoryControl.value);
            }
          } else {
            this.store.dispatch(CategoryActions.loadCategories());
          }
        },
        error: (error: unknown) =>
          console.error('Error fetching categories:', error),
      });
  }

  onBack(): void {
    this.location.back();
  }

  // Dispatches action to search/load paginated brands.
  onBrandSearch(term: string): void {
    this.store.dispatch(BrandActions.loadPaginatedBrands({ pageNumber: 1, pageSize: 10, search: term }));
  }

  // Dispatches action to search/load paginated categories.
  onCategorySearch(term: string): void {
    this.store.dispatch(CategoryActions.loadPaginatedCategories({ pageNumber: 1, pageSize: 10, search: term }));
  }
}