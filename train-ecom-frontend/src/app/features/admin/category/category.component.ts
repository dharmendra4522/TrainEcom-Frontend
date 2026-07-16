import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../core/services/category.service';
import {
  Category,
  CreateCategoryRequest,
} from '../../../core/models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../../shared/components/generic-dialog/generic-dialog.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  categories: Category[] = [];
  isLoading: boolean = false;

  ngOnInit() {
    this.fetchAllCategories();
  }

  fetchAllCategories() {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching categories:', error);
      },
    });
  }

  createCategory(payload: CreateCategoryRequest): void {
    this.categoryService.createCategory(payload).subscribe({
      next: (res: Category) => {
        this.snackBar.open('Category created successfully.', 'Close', {
          duration: 3000,
        });
        this.fetchAllCategories();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.snackBar.open(
          'Failed to create category. Please try again later.',
          'Close',
          {
            duration: 3000,
          },
        );
      },
    });
  }

  updateCategory(id: number, payload: CreateCategoryRequest): void {
    this.categoryService.updateCategory(id, payload).subscribe({
      next: (res: Category) => {
        this.snackBar.open('Category updated successfully.', 'Close', {
          duration: 3000,
        });
        this.fetchAllCategories();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.snackBar.open(
          'Failed to update category. Please try again later.',
          'Close',
          {
            duration: 3000,
          },
        );
      },
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.snackBar.open('Category deleted successfully.', 'Close', {
            duration: 3000,
          });
          this.fetchAllCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.snackBar.open(
            'Failed to delete category. Please try again later.',
            'Close',
            {
              duration: 3000,
            },
          );
        },
      });
    }
  }

  openCategoryDialog(category?: Category) {
    const isEdit = !!category;
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '400px',
      data: {
        title: isEdit ? 'Edit Category' : 'Create Category',
        formFields: this.getCategoryFormFields(category),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (isEdit && category?.id) {
          this.updateCategory(category.id, result);
        } else {
          this.createCategory(result);
        }
      }
    });
  }

  private getCategoryFormFields(category?: Category) {
    return [
      {
        key: 'name',
        label: 'Category Name',
        type: 'text',
        value: category?.name || '',
        required: true,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        value: category?.description || '',
        required: true,
      },
    ];
  }
}
