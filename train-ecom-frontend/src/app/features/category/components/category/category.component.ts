import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from '../../../../core/models/category.model';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { Store } from '@ngrx/store';
import { BrandCategoryDialogComponent } from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnDestroy {
  private dialog = inject(MatDialog);
  private store = inject(Store);
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
    const isSubCategoryTab = this.activeTabIndex === 1;
    const dialogRef = this.dialog.open(BrandCategoryDialogComponent, {
      width: '500px',
      data: {
        title: isSubCategoryTab ? 'Create Sub-Category' : 'Create Category',
        type: isSubCategoryTab ? 'Sub-Category' : 'Category',
        isEdit: false,
        initialData: null,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (!result) {
          return;
        }

        const payload =
          isSubCategoryTab && result.parentCategoryId !== undefined
            ? {
                name: result.name,
                description: result.description,
                parentCategoryId: result.parentCategoryId || null,
              }
            : {
                name: result.name,
                description: result.description,
              };

        this.store.dispatch(
          CategoryActions.createCategory({
            category: payload as Category,
          }),
        );
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
