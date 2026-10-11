import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreateCategoryRequest } from '../../../../core/models/category.model';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { Store } from '@ngrx/store';
import { BrandCategoryDialogComponent } from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';
import { CategoryService } from '../../../../core/services/category.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnDestroy {
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  activeTabIndex = 0;
  categorySearchControl = new FormControl('', { nonNullable: true });
  subCategorySearchControl = new FormControl('', { nonNullable: true });

  get activeSearchControl(): FormControl<string> {
    return this.activeTabIndex === 1
      ? this.subCategorySearchControl
      : this.categorySearchControl;
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
  }

  openCategoryDialog(): void {
    const isSub = this.activeTabIndex === 1;
    const dialogRef = this.dialog.open(BrandCategoryDialogComponent, {
      width: '500px',
      data: {
        title: isSub ? 'Create Sub-Category' : 'Create Category',
        type: isSub ? 'Sub-Category' : 'Category',
        isEdit: false,
        initialData: null,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: CreateCategoryRequest | undefined) => {
      if (result) this.handleDialogCreate(result, isSub);
    });
  }

  private handleDialogCreate(result: CreateCategoryRequest, isSub: boolean): void {
    const payload: CreateCategoryRequest = {
      name: result.name,
      description: result.description,
      parentCategoryId: isSub ? (result.parentCategoryId ?? null) : undefined,
    };

    if (isSub) {
      this.store.dispatch(CategoryActions.createCategory({ category: payload }));
      return;
    }

    this.categoryService.createCategory(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notificationService.showSuccess('Category created successfully.');
        this.store.dispatch(CategoryActions.loadPaginatedCategories({
          pageNumber: 1, pageSize: 10, search: this.categorySearchControl.value.trim() || undefined, refresh: true,
        }));
      },
      error: (err: unknown) => {
        console.error('Error creating category:', err);
        this.notificationService.showError('Failed to create category. Please try again.');
      },
    });
  }

  resetSearch(): void {
    this.activeSearchControl.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
