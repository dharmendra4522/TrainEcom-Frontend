import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';
import {
  Category,
  CreateCategoryRequest,
} from '../../../../core/models/product.model';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);

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
        this.notification.showError('Failed to fetch categories. Please try again later.');
      },
    });
  }

  createCategory(payload: CreateCategoryRequest): void {
    this.categoryService.createCategory(payload).subscribe({
      next: (res: Category) => {
        this.notification.showSuccess('Category created successfully.');
        this.fetchAllCategories();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.notification.showError('Failed to create category. Please try again later.');
      },
    });
  }

  updateCategory(id: string, payload: CreateCategoryRequest): void {
    this.categoryService.updateCategory(id, payload).subscribe({
      next: (res: Category) => {
        this.notification.showSuccess('Category updated successfully.');
        this.fetchAllCategories();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.notification.showError('Failed to update category. Please try again later.');
      },
    });
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.notification.showSuccess('Category deleted successfully.');
          this.fetchAllCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.notification.showError('Failed to delete category. Please try again later.');
        },
      });
    }
  }

  openCategoryDialog(category?: Category) {
    const isEdit = !!category;
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '500px',
      data: {
        title: isEdit ? 'Edit Category' : 'Create Category',
        fields: this.getCategoryFormFields(category),
        submitButtonText: isEdit ? 'Update' : 'Add'
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
