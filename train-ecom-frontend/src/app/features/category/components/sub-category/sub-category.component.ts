import { Component, inject, Input } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '../../../../core/services/category.service';
import {
  SubCategoryList,
  SubCategoryListField,
  UpdateCategoryRequest
} from '../../../../core/models/category.model';
import { FormControl } from '@angular/forms';
import {
  DropdownOptions,
  TableAction,
  TableActionEvent,
  TableColumn
} from '../../../../core/models/table.model';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { NotificationService } from '../../../../core/services/notification.service';
import * as CategoryActions from '../../../../core/store/category/category.action';
import {
  BrandCategoryDialogComponent,
  BrandCategoryDialogData,
  BrandCategoryDialogResult,
} from '../../../../shared/components/brand-category-dialog/brand-category-dialog.component';

function isSubCategoryList(row: unknown): row is SubCategoryList {
  return (
    typeof row === 'object' &&
    row !== null &&
    'id' in row &&
    typeof row.id === 'number' &&
    'subCategoryName' in row &&
    typeof row.subCategoryName === 'string' &&
    'parentCategoryName' in row &&
    typeof row.parentCategoryName === 'string' &&
    'description' in row &&
    typeof row.description === 'string' &&
    'productCount' in row &&
    typeof row.productCount === 'number'
  );
}

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.component.html',
  styleUrl: './sub-category.component.css'
})
export class SubCategoryComponent {
  private categoryService = inject(CategoryService);
  private storeActions = inject(Actions);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  @Input() searchControl = new FormControl('', { nonNullable: true });

  subCategories: SubCategoryList[] = [];
  isLoading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 15;
  showHeaderFilter: boolean = true;
  headerFilters: Record<string, string> = {};
  selectedFiltersMap: Record<string, (string | number)[]> = {
    parentCategoryName: []
  };
  dropdownOptionsMap: Record<string, DropdownOptions[]> = {
    parentCategoryName: []
  };
  private allParentCategoryOptions: DropdownOptions[] = [];
  selectedParentCategoryIds: number[] = [];

  columns: TableColumn[] = [
    {key: 'id', label: 'ID', filterable: true, filterType: 'search', clickable: true },
    { key: 'subCategoryName', label: 'Sub-Category Name', filterable: true, filterType: 'search' },
    { key: 'parentCategoryName', label: 'Parent Category', filterable: true, filterType: 'dropdown' },
    { key: 'description', label: 'Description', filterable: true, filterType: 'search', filterDisabled: true },
    { key: 'productCount', label: 'Product Count', filterable: true, filterType: 'search', filterDisabled: true }
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
    },
  ];

  ngOnInit(): void {
    this.loadParentCategoryOptions();
    this.loadSubCategories(1, this.pageSize);
    this.setupSearchFilter();
    this.storeActions
      .pipe(ofType(CategoryActions.createCategorySuccess), takeUntil(this.destroy$))
      .subscribe(() => this.refreshSubCategories());
  }

  private loadSubCategories(
    pageNumber: number, pageSize: number,
    search?: string
  ): void {
    this.isLoading = true;
    const searchValue = this.getSearchValue() ?? search;
    const searchField = searchValue ? this.getSearchField() : undefined;

    this.categoryService.fetchSubCategories(
      pageNumber,
      pageSize,
      searchValue || undefined,
      this.selectedParentCategoryIds,
      searchField
    ).subscribe({
      next: (response) => {
        if (pageNumber === 1) {
          this.subCategories = response.items;
        } else {
          this.subCategories = [...this.subCategories, ...response.items];
        }
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching sub-categories:', error);
        this.isLoading = false;
      }
    });
  }


  private setupSearchFilter(): void {
    this.searchControl.valueChanges
      .pipe(
        map((searchTerm) => searchTerm.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          this.currentPage = 1;
          this.isLoading = true;
          const headerSearch = this.getSearchValue();
          const activeSearch = headerSearch ?? searchTerm;

          return this.categoryService
            .fetchSubCategories(
              this.currentPage,
              this.pageSize,
              activeSearch || undefined,
              this.selectedParentCategoryIds,
              activeSearch ? this.getSearchField() : undefined
            )
            .pipe(
              catchError((error) => {
                console.error('Error fetching sub-categories:', error);
                return EMPTY;
              }),
              finalize(() => {
                this.isLoading = false;
              })
            );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((response) => {
        this.subCategories = response.items;
        this.totalRecords = response.totalRecords;
      });
  }

 onTableScroll(): void {
    if (!this.isLoading && this.subCategories.length < this.totalRecords) {
      this.currentPage++;
      const currentSearch = this.searchControl.value.trim();
      this.loadSubCategories(this.currentPage, this.pageSize, currentSearch);
    }
  }

  handleSubCategoryAction(event: TableActionEvent): void {
    if (!isSubCategoryList(event.row)) {
      return;
    }
    const subCategory = event.row;

    if (event.action === 'edit') {
      this.openEditDialog(subCategory);
    } else if (event.action === 'delete') {
      this.confirmDialog
        .confirm(
          `Are you sure you want to delete the sub-category "${subCategory.subCategoryName}"?`,
          'Delete',
          'Cancel'
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((confirmed) => {
          if (confirmed) {
            this.deleteSubCategory(subCategory.id);
          }
        });
    }
  }

  private openEditDialog(subCategory: SubCategoryList): void {
    const data: BrandCategoryDialogData = {
      title: 'Edit Sub-Category',
      type: 'Sub-Category',
      isEdit: true,
      initialData: {
        name: subCategory.subCategoryName,
        description: subCategory.description,
        parentCategoryId: subCategory.parentCategoryId,
        parentCategoryName: subCategory.parentCategoryName
      }
    };
    const dialogRef = this.dialog.open<
      BrandCategoryDialogComponent,
      BrandCategoryDialogData,
      BrandCategoryDialogResult
    >(BrandCategoryDialogComponent, { width: '500px', data });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result?.parentCategoryId === undefined || result.parentCategoryId === null) {
          return;
        }

        const payload: UpdateCategoryRequest = {
          name: result.name,
          description: result.description,
          parentCategoryId: result.parentCategoryId
        };
        this.isLoading = true;
        this.categoryService
          .updateCategory(subCategory.id, payload)
          .pipe(
            finalize(() => (this.isLoading = false)),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: () => {
              this.notificationService.showSuccess(
                'Sub-category updated successfully.'
              );
              this.refreshSubCategories();
            },
            error: (error) => {
              this.notificationService.showError(
                'Failed to update sub-category. Please try again.'
              );
            }
          })
      });
  }

  private deleteSubCategory(subCategoryId: number): void {
    this.isLoading = true;
    this.categoryService
      .deleteCategory(subCategoryId)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Sub-category deleted successfully.',
          );
          this.refreshSubCategories();
        },
        error: (error) => {
          console.error('Error deleting sub-category:', error);
          this.notificationService.showError(
            'Failed to delete sub-category. Please try again.'
          );
        }
      });
  }

  private refreshSubCategories(): void {
    this.currentPage = 1;
    this.loadSubCategories(1, this.pageSize, this.searchControl.value.trim());
  }

  resetSearch(): void {
    this.searchControl.setValue('');
  }

  onTableFilterChanged(filters: Record<string, string>): void {
    this.headerFilters = filters;
    this.currentPage = 1;
    this.loadSubCategories(this.currentPage, this.pageSize);
  }

  onTableFilterCleared(columnKey: string): void {
    const updatedFilters = { ...this.headerFilters };
    delete updatedFilters[columnKey];
    this.headerFilters = updatedFilters;
    this.currentPage = 1;
    this.loadSubCategories(this.currentPage, this.pageSize);
  }

  onDropdownSelectionChanged(event: {
    columnKey: string;
    option: DropdownOptions;
  }): void {
    if (event.columnKey !== 'parentCategoryName') {
      return;
    }

    const selectedValues = [...(this.selectedFiltersMap[event.columnKey] ?? [])];
    const selectedIndex = selectedValues.indexOf(event.option.id);
    if (selectedIndex >= 0) {
      selectedValues.splice(selectedIndex, 1);
    } else {
      selectedValues.push(event.option.id);
    }

    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      [event.columnKey]: selectedValues
    };
  }

  onDropdownSearchChanged(event: {
    columnKey: string;
    searchTerm: string;
  }): void {
    if (event.columnKey !== 'parentCategoryName') {
      return;
    }

    const searchTerm = event.searchTerm.trim().toLowerCase();
    const filteredOptions = this.allParentCategoryOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm),
    );

    this.dropdownOptionsMap = {
      ...this.dropdownOptionsMap,
      parentCategoryName: filteredOptions,
    };
  }

  onFilterApply(event: { columnKey: string }): void {
    if (event.columnKey !== 'parentCategoryName') {
      return;
    }

    this.selectedParentCategoryIds = this.getSelectedParentCategoryIds();
    this.currentPage = 1;
    this.loadSubCategories(this.currentPage, this.pageSize);
  }

  onFilterClear(columnKey: string): void {
    if (columnKey !== 'parentCategoryName') {
      return;
    }

    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      [columnKey]: [],
    };
    this.selectedParentCategoryIds = [];
    this.currentPage = 1;
    this.loadSubCategories(this.currentPage, this.pageSize);
  }

  private loadParentCategoryOptions(): void {
    this.categoryService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.dropdownOptionsMap = {
            ...this.dropdownOptionsMap,
            parentCategoryName: categories.map((category) => ({
              id: category.id,
              label: category.name
            }))
          };
          this.allParentCategoryOptions =
            this.dropdownOptionsMap['parentCategoryName'] ?? [];
        },
        error: (error) => {
          console.error('Error fetching parent categories:', error);
        },
      });
  }

  private getSelectedParentCategoryIds(): number[] {
    return (this.selectedFiltersMap['parentCategoryName'] ?? []).filter(
      (value): value is number => typeof value === 'number'
    );
  }

  private getSearchValue(): string | undefined {
    return (
      this.headerFilters['id'] ||
      this.headerFilters['subCategoryName'] ||
      this.headerFilters['parentCategoryName'] ||
      undefined
    );
  }

  private getSearchField(): SubCategoryListField | undefined {
    const activeKey = this.headerFilters['id']
      ? 'id'
      : this.headerFilters['subCategoryName']
        ? 'subCategoryName'
        : this.headerFilters['parentCategoryName']
          ? 'parentCategoryName'
          : undefined;

    switch (activeKey) {
      case 'id':
        return SubCategoryListField.ID;
      case 'subCategoryName':
        return SubCategoryListField.SubCategoryName;
      case 'parentCategoryName':
        return SubCategoryListField.ParentCategoryname;
      default:
        return undefined;
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
