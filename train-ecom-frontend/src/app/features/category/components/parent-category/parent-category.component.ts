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
  takeUntil,
} from 'rxjs/operators';
import { Category } from '../../../../core/models/category.model';
import {
  TableAction,
  TableActionEvent,
  TableColumn,
} from '../../../../core/models/table.model';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import * as CategoryActions from '../../../../core/store/category/category.action';
import {
  selectCategoryLoading,
  selectCategoryTotalRecords,
  selectPaginatedCategories,
} from '../../../../core/store/category/category.selectors';
import { BrandCategoryDialogComponent } from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';
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
  private confirmDialog = inject(ConfirmDialogServiceService);
  private destroy$ = new Subject<void>();

  paginatedCategories$: Observable<Category[]> = this.store.select(
    selectPaginatedCategories,
  );
  isLoading$: Observable<boolean> = this.store.select(selectCategoryLoading);
  totalRecords$: Observable<number> = this.store.select(
    selectCategoryTotalRecords,
  );

  currentPage = 1;
  pageSize = 10;
  showHeaderFilter: boolean = true;

  columns: TableColumn[] = [
    { key: 'name', label: 'Category Name', filterable: true },
    { key: 'description', label: 'Description'},
    { key: 'numberOfProducts', label: 'Total Products', filterable: true }
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

  ngOnInit(): void {
    this.loadPage(1, this.pageSize, this.searchControl.value);
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
          this.loadPage(1, this.pageSize, searchTerm);
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
              this.searchControl.value.trim(),
            );
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

  private loadPage(pageNumber: number, pageSize: number, search: string): void {
    this.currentPage = pageNumber;
    this.store.dispatch(
      CategoryActions.loadPaginatedCategories({
        pageNumber,
        pageSize,
        search: search.trim() || undefined,
      }),
    );
  }

  private updateCategory(
    id: string | number,
    payload: Partial<Category>,
  ): void {
    this.store.dispatch(
      CategoryActions.updateCategory({
        categoryId: String(id),
        category: payload as Category,
      }),
    );
  }

  private deleteCategory(id: string | number): void {
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this category?',
        'Delete',
        'Cancel',
      )
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.store.dispatch(
            CategoryActions.deleteCategory({ categoryId: String(id) }),
          );
        }
      });
  }

  private openCategoryDialog(category: Category): void {
    const dialogRef = this.dialog.open(BrandCategoryDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Category',
        type: 'Category',
        isEdit: true,
        initialData: { name: category.name, description: category.description },
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: { name: string; description: string } | null | undefined) => {
          if (result && category.id) {
            this.updateCategory(category.id, result);
          }
        },
      );
  }
}
