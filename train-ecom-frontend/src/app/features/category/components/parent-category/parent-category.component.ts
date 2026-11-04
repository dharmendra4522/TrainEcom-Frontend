import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  take,
  takeUntil
} from 'rxjs/operators';
import {
  Category,
  CategoryListField,
  UpdateCategoryRequest
} from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  TableAction,
  TableActionEvent,
  TableColumn
} from '../../../../core/models/table.model';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import * as CategoryActions from '../../../../core/store/category/category.action';
import {
  selectCategoryLoading,
  selectCategoryTotalRecords,
  selectPaginatedCategories
} from '../../../../core/store/category/category.selectors';
import {
  BrandCategoryDialogComponent,
  BrandCategoryDialogData,
  BrandCategoryDialogResult
} from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-parent-category',
  templateUrl: './parent-category.component.html',
  styleUrl: './parent-category.component.css'
})
export class ParentCategoryComponent implements OnInit, OnDestroy {
  @Input() searchControl!: FormControl<string>;

  private dialog = inject(MatDialog);
  private store = inject(Store);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private destroy$ = new Subject<void>();

  paginatedCategories$: Observable<Category[]> = this.store.select(
    selectPaginatedCategories
  );
  isLoading$: Observable<boolean> = this.store.select(selectCategoryLoading);
  totalRecords$: Observable<number> = this.store.select(
    selectCategoryTotalRecords
  );

  currentPage: number = 1;
  pageSize: number = 15;
  pageNumber: number = 1
  showHeaderFilter: boolean = true;
  headerFilters: Record<string, string> = {};

  columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      filterable: true,
      filterType: 'search',
      clickable: true
    },
    {
      key: 'name',
      label: 'Category Name',
      filterable: true,
      filterType: 'search'
    },
    {
      key: 'description',
      label: 'Description',
      filterable: true,
      filterType: 'search',
      filterDisabled: true
    },
    {
      key: 'numberOfProducts',
      label: 'Total Products',
      filterable: true,
      filterType: 'search',
      filterDisabled: true
    },
    {
      key: 'numberOfSubCategories',
      label: 'Total Sub-Categories',
      filterable: true,
      filterType: 'search',
      filterDisabled: true
    }
  ];

  actions: TableAction[] = [
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      tooltip: 'Edit'
    },
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete'
    }
  ];

  ngOnInit(): void {
    this.loadPage(this.pageNumber, this.pageSize, this.searchControl.value);
    this.setupSearchFilter();
  }

  private setupSearchFilter(): void {
    this.searchControl.valueChanges
      .pipe(
        map((searchTerm) => searchTerm.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          this.currentPage = 1;
          this.loadPage(this.pageNumber, this.pageSize, searchTerm);
          return EMPTY;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTableScroll(): void {
    this.paginatedCategories$.pipe(take(1)).subscribe((categories) => {
      this.totalRecords$.pipe(take(1)).subscribe((total) => {
        this.isLoading$.pipe(take(1)).subscribe((isLoading) => {
          if (!isLoading && categories.length < total) {
            this.currentPage++;
            this.loadPage(
              this.currentPage,
              this.pageSize,
              this.searchControl.value.trim()
            )
          }
        })
      })
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
    pageNumber: number,
    pageSize: number,
    search: string,
    refresh = false
  ): void {
    this.currentPage = pageNumber;
    const headerSearch = this.getSearchValue();
    this.store.dispatch(
      CategoryActions.loadPaginatedCategories({
        pageNumber,
        pageSize,
        search: headerSearch || search.trim() || undefined,
        searchField: headerSearch ? this.getSearchField() : undefined,
        refresh
      })
    );
  }

  private updateCategory(
    id: number,
    payload: UpdateCategoryRequest
  ): void {
    this.categoryService
      .updateCategory(id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Category updated successfully.');
          this.loadPage(this.pageNumber, this.pageSize, this.searchControl.value, true);
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.notificationService.showError(
            'Failed to update category. Please try again.'
          );
        }
      });
  }

  private deleteCategory(id: number): void {
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this category?',
        'Delete',
        'Cancel'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.categoryService
            .deleteCategory(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.notificationService.showSuccess(
                  'Category deleted successfully.'
                );
                this.loadPage(1, this.pageSize, this.searchControl.value, true);
              },
              error: (error) => {
                this.notificationService.showError(
                  'Failed to delete category. Please try again.'
                );
              }
            });
        }
      });
  }

  private openCategoryDialog(category: Category): void {
    const data: BrandCategoryDialogData = {
      title: 'Edit Category',
      type: 'Category',
      isEdit: true,
      initialData: { name: category.name, description: category.description }
    };
    const dialogRef = this.dialog.open<
      BrandCategoryDialogComponent,
      BrandCategoryDialogData,
      BrandCategoryDialogResult
    >(BrandCategoryDialogComponent, {
      width: '500px',
      data
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result && category.id) {
          const payload: UpdateCategoryRequest = {
            name: result.name,
            description: result.description
          };
          this.updateCategory(category.id, payload);
        }
      });
  }

  private getSearchValue(): string | undefined {
    return (
      this.headerFilters['id'] ||
      this.headerFilters['name'] ||
      this.headerFilters['description'] ||
      undefined
    );
  }

  private getSearchField():
    CategoryListField | undefined {
    const activeKey = this.headerFilters['id']
      ? 'id'
      : this.headerFilters['name']
        ? 'name'
        : this.headerFilters['description']
          ? 'description'
          : undefined;

    switch (activeKey) {
      case 'id':
        return CategoryListField.ID;
      case 'name':
        return CategoryListField.Name;
      case 'description':
        return CategoryListField.Description;
      default:
        return undefined;
    }
  }

  onTableFilterChanged(
    filters: Record<string, string>
  ): void {
    this.headerFilters = filters;
    this.currentPage = 1;
    this.loadPage(
      this.currentPage,
      this.pageSize,
      ''
    );
  }

}
