import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {
  Category,
  CreateCategoryRequest,
} from '../../../../core/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Store } from '@ngrx/store';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { selectCategoryLoading, selectCategoryTotalRecords, selectPaginatedCategories } from '../../../../core/store/category/category.selectors';

import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  paginatedCategories$: Observable<Category[]> = this.store.select(selectPaginatedCategories);
  isLoading$: Observable<boolean> = this.store.select(selectCategoryLoading);
  totalRecords$: Observable<number> = this.store.select(selectCategoryTotalRecords);

  // Search control and filtered observable
  searchControl = new FormControl('');
  filteredCategories$!: Observable<Category[]>;
  pageIndex$ = new BehaviorSubject<number>(0);
  pageSize$ = new BehaviorSubject<number>(10);

  columns: TableColumn[] = [
    { key: 'name', label: 'Category Name' },
    { key: 'description', label: 'Description' }
  ];

  actions: TableAction[] = [
    { actionKey: 'edit', icon: 'edit', color: 'primary', tooltip: 'Edit Category' },
    { actionKey: 'delete', icon: 'delete', color: 'warn', tooltip: 'Delete Category' }
  ];

  ngOnInit() {
    this.setupSearchFilter();
    this.loadPage();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchFilter(): void {
    this.filteredCategories$ = combineLatest([
      this.paginatedCategories$,
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(400), distinctUntilChanged())
    ]).pipe(
      map(([categories, search]) => {
        const query = (search || '').toLowerCase().trim();
        if (!query) {
          return categories;
        }
        return categories.filter(category => 
          (category.name || '').toLowerCase().includes(query) || 
          (category.description || '').toLowerCase().includes(query)
        );
      })
    );
  }

  handleTableAction(event: TableActionEvent<Category>): void {
    if (event.action === 'edit') {
      this.openCategoryDialog(event.row);
    } else if (event.action === 'delete') {
      this.deleteCategory(event.row.id);
    }
  }

  handlePageChange(event: PageEvent): void {
    this.pageIndex$.next(event.pageIndex);
    this.pageSize$.next(event.pageSize);
    this.loadPage(event.pageIndex, event.pageSize);
  }

  private loadPage(pageIndex = this.pageIndex$.value, pageSize = this.pageSize$.value): void {
    this.store.dispatch(CategoryActions.loadPaginatedCategories({
      pageNumber: pageIndex + 1,
      pageSize,
    }));
  }

  createCategory(payload: CreateCategoryRequest): void {
    this.store.dispatch(CategoryActions.createCategory({ category: payload as Category }));
  }

  updateCategory(id: string, payload: CreateCategoryRequest): void {
    this.store.dispatch(CategoryActions.updateCategory({ categoryId: id, category: payload as Category }));
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.store.dispatch(CategoryActions.deleteCategory({ categoryId: id }));
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
