import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {
  Category,
  CreateCategoryRequest,
} from '../../../../core/models/category.model';
import { MatDialog } from '@angular/material/dialog';
import { BrandCategoryDialogComponent } from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Store } from '@ngrx/store';
import * as CategoryActions from '../../../../core/store/category/category.action';
import { selectCategoryLoading, selectCategoryTotalRecords, selectPaginatedCategories } from '../../../../core/store/category/category.selectors';

import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, distinctUntilChanged, debounceTime } from 'rxjs/operators';
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
    { key: 'description', label: 'Description' },
    { key: 'numberOfProducts', label: 'Total Products' }
  ];

  actions: TableAction[] = [
    { actionKey: 'edit', icon: 'edit', color: 'primary', tooltip: 'Edit Category' },
    { actionKey: 'delete', icon: 'delete', color: 'warn', tooltip: 'Delete Category' }
  ];

  ngOnInit() {
   
    this.loadPage();
    this.setupSearchFilter();
  }

  private setupSearchFilter(): void {
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((searchTerm) => {
      this.pageIndex$.next(0); // Reset to first page on search
      this.loadPage(0, this.pageSize$.value, searchTerm || '');
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }



  handleTableAction(event: TableActionEvent): void {
    const category = event.row as Category;
    if (event.action === 'edit') {
      this.openCategoryDialog(category);
    } else if (event.action === 'delete') {
      this.deleteCategory(category.id);
    }
  }

 handlePageChange(event: PageEvent): void {
    this.pageIndex$.next(event.pageIndex);
    this.pageSize$.next(event.pageSize);
    const currentSearch = this.searchControl.value || '';
    this.loadPage(event.pageIndex, event.pageSize, currentSearch);
  }

  private loadPage(
    pageIndex = this.pageIndex$.value, 
    pageSize = this.pageSize$.value, 
    search = this.searchControl.value || ''
  ): void {
    this.store.dispatch(CategoryActions.loadPaginatedCategories({
      pageNumber: pageIndex + 1,
      pageSize,
      search: search.trim() !== '' ? search.trim() : undefined
    }));
  }

  createCategory(payload: CreateCategoryRequest): void {
    this.store.dispatch(CategoryActions.createCategory({ category: payload as Category }));
  }

  updateCategory(id: string, payload: CreateCategoryRequest): void {
    this.store.dispatch(CategoryActions.updateCategory({ categoryId: id, category: payload as Category }));
  }

  deleteCategory(id: string): void {
    this.confirmDialog.confirm('Are you sure you want to delete this category?', 'Delete', 'Cancel').subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(CategoryActions.deleteCategory({ categoryId: id }));
      }
    });
  }

  openCategoryDialog(category?: Category) {
    const isEdit = !!category;
    const dialogRef = this.dialog.open(BrandCategoryDialogComponent, {
      width: '500px',
      data: {
        title: isEdit ? 'Edit Category' : 'Create Category',
        type: 'Category',
        isEdit: isEdit,
        initialData: category ? { name: category.name, description: category.description } : null
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
