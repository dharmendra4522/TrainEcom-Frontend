import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { getFieldError, noSpaceAllow, trimControlValue } from '../../../features/auth/register.utils';

export interface BrandCategoryDialogData {
  title: string;
  type: 'Brand' | 'Category' | 'Sub-Category';
  isEdit: boolean;
  initialData?: {
    name: string;
    description: string;
    parentCategoryId?: number | null;
    parentCategoryName?: string | null;
  };
}

export interface BrandCategoryDialogResult {
  name: string;
  description: string;
  parentCategoryId?: number | null;
}

@Component({
  selector: 'app-brand-category-dialog',
  templateUrl: './brand-category-dialog.component.html',
  styleUrl: './brand-category-dialog.component.css'
})
export class BrandCategoryDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();
  public dialogRef = inject(
    MatDialogRef<BrandCategoryDialogComponent, BrandCategoryDialogResult>,
  );

  form!: FormGroup;
  parentCategories: Array<{ id: number; name: string }> = [];
  filteredParentCategories: Array<{ id: number; name: string }> = [];
  parentCategorySearchControl = new FormControl('', { nonNullable: true });
  private hasParentCategoriesLoaded = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: BrandCategoryDialogData) { }

  ngOnInit(): void {
    this.initializeForm();

    if (this.data.type === 'Sub-Category') {
      this.initializeSubCategoryControls();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: [
        this.data.initialData?.name || '',
        [Validators.required, Validators.maxLength(100), noSpaceAllow()]
      ],
      description: [
        this.data.initialData?.description || '',
        [Validators.maxLength(500), noSpaceAllow()]
      ]
    });
  }

  private initializeSubCategoryControls(): void {
    this.form.addControl(
      'parentCategoryId',
      this.fb.control(
        this.data.initialData?.parentCategoryId ?? '',
        [Validators.required]
      )
    );

    this.loadParentCategories();
    this.bindParentCategorySearch();
  }

  private bindParentCategorySearch(): void {
    this.parentCategorySearchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        this.applyParentCategoryFilter(value);
      });
  }

  private applyParentCategoryFilter(value: string): void {
    const searchTerm = value.trim().toLowerCase();

    this.filteredParentCategories = searchTerm
      ? this.parentCategories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm)
      )
      : [...this.parentCategories];
  }

  private loadParentCategories(): void {
    if (this.hasParentCategoriesLoaded) {
      return;
    }

    this.hasParentCategoriesLoaded = true;

    this.categoryService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: Category[]) => {
          this.parentCategories = categories.map((category) => ({
            id: category.id,
            name: category.name
          }));
          this.filteredParentCategories = [...this.parentCategories];

          const initialParentId = this.data.initialData?.parentCategoryId;
          const initialParentName = this.data.initialData?.parentCategoryName
            ?.trim()
            .toLocaleLowerCase();
          const selectedParent = this.parentCategories.find(
            (category) => category.id === initialParentId,
          ) ?? this.parentCategories.find(
            (category) =>
              category.name.trim().toLocaleLowerCase() === initialParentName
          );

          if (selectedParent) {
            this.form.get('parentCategoryId')?.setValue(selectedParent.id);
          }
        },
        error: (error) => {
          console.error('Error fetching parent categories:', error);
          this.parentCategories = [];
          this.filteredParentCategories = [];
        },
      });
  }

  onSubmit(): void {
    this.trimOnBlur('name');
    this.trimOnBlur('description');
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.form.get(controlName);
    return getFieldError(control, label);
  }

  trimOnBlur(controlName: string): void {
    const control = this.form.get(controlName);
    if (control && typeof control.value === 'string') {
      if (control.value.trim().length > 0) {
        trimControlValue(control);
      }
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }
}
