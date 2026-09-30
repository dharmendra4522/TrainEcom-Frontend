import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {
  Category,
  CreateCategoryRequest,
} from '../../../../core/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { BrandCategoryDialogComponent } from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
} from '../../../../core/models/table.model';
import { Store } from '@ngrx/store';
import * as CategoryActions from '../../../../core/store/category/category.action';
import {
  selectCategoryLoading,
  selectCategoryTotalRecords,
  selectPaginatedCategories,
} from '../../../../core/store/category/category.selectors';

import { Observable, Subject } from 'rxjs';
import {
  takeUntil,
  map,
  distinctUntilChanged,
  debounceTime,
  take,
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private destroy$ = new Subject<void>();

  paginatedCategories$: Observable<Category[]> = this.store.select(
    selectPaginatedCategories,
  );
  isLoading$: Observable<boolean> = this.store.select(selectCategoryLoading);
  totalRecords$: Observable<number> = this.store.select(
    selectCategoryTotalRecords,
  );

  // Search control and filtered observable
  searchControl = new FormControl('', { nonNullable: true });
  filteredCategories$!: Observable<Category[]>;
  currentPage: number = 1;
  pageSize: number = 10;

  columns: TableColumn[] = [
    { key: 'name', label: 'Category Name' },
    { key: 'description', label: 'Description' },
    { key: 'numberOfProducts', label: 'Total Products' }
  ];

  actions: TableAction[] = [
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      tooltip: 'Edit Category'
    },
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete Category'
    }
  ];

  ngOnInit() {
    this.currentPage = 1;
    this.loadPage(1, this.pageSize);
    this.setupSearchFilter();
  }

  private setupSearchFilter(): void {
    this.searchControl.valueChanges
      .pipe(
        map((searchTerm) => searchTerm.trim()),
        distinctUntilChanged(),
        debounceTime(300),
        takeUntil(this.destroy$),
      )
      .subscribe((searchTerm) => {
        this.currentPage = 1;
        this.loadPage(1, this.pageSize, searchTerm);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTableScroll(): void {
    this.paginatedCategories$.pipe(take(1)).subscribe((categories) => {
      this.totalRecords$.pipe(take(1)).subscribe((total) => {
        this.isLoading$.pipe(take(1)).subscribe((isLoading) => {
          if (!isLoading && categories.length < total) {
            this.currentPage++;
            const currntSearch = this.searchControl.value.trim();
            this.loadPage(this.currentPage, this.pageSize, currntSearch);
          }
        });
      });
    });
  }

  handleTableAction(event: TableActionEvent): void {
    const category = event.row as Category;
    if (event.action === 'edit') {
      this.openCategoryDialog(category);
    } else if (event.action === 'delete') {
      this.deleteCategory(category.id);
    }
  }

  private loadPage(
    pageNumber = this.currentPage,
    pageSize = this.pageSize,
    search = this.searchControl.value || ''
  ): void {
    this.currentPage = pageNumber;
    this.store.dispatch(
      CategoryActions.loadPaginatedCategories({
        pageNumber,
        pageSize,
        search: search.trim() !== '' ? search.trim() : undefined
      }),
    );
  }

  createCategory(payload: CreateCategoryRequest): void {
    this.store.dispatch(
      CategoryActions.createCategory({ category: payload as Category })
    );
  }

  updateCategory(id: string | number, payload: CreateCategoryRequest): void {
    this.store.dispatch(
      CategoryActions.updateCategory({
        categoryId: String(id),
        category: payload as Category
      }),
    );
  }

  deleteCategory(id: string | number): void {
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this category?',
        'Delete',
        'Cancel'
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(
            CategoryActions.deleteCategory({ categoryId: String(id) })
          );
        }
      });
  }

  openCategoryDialog(category?: Category): void {
    const isEdit = !!category;
    const dialogRef = this.dialog.open(BrandCategoryDialogComponent, {
      width: '500px',
      data: {
        title: isEdit ? 'Edit Category' : 'Create Category',
        type: 'Category',
        isEdit: isEdit,
        initialData: category
          ? { name: category.name, description: category.description }
          : null
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          if (isEdit && category?.id) {
            this.updateCategory(category.id, result);
          } else {
            this.createCategory(result);
          }
        }
      });
  }

  resetSearch(): void {
    this.searchControl.setValue('');
  }
}
