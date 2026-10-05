import { Component, inject, Input } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';
import { SubCategoryList } from '../../../../core/models/category.model';
import { FormControl } from '@angular/forms';
import { TableAction, TableActionEvent, TableColumn } from '../../../../core/models/table.model';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.component.html',
  styleUrl: './sub-category.component.css',
})
export class SubCategoryComponent {
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  @Input() searchControl = new FormControl('', { nonNullable: true });

  subCategories: SubCategoryList[] = [];
  isLoading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  columns: TableColumn[] = [
    { key: 'subCategoryName', label: 'Sub-Category Name' },
    { key: 'parentCategoryName', label: 'Parent Category' },
    { key: 'description', label: 'Description' },
    { key: 'productCount', label: 'Product Count' },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      tooltip: 'Edit Sub-Category',
    },
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete Sub-Category',
    },
  ];

  ngOnInit(): void {
    this.loadSubCategories(1, this.pageSize);
    this.setupSearchFilter();
  }

  private loadSubCategories(
    pageNumber: number, pageSize: number,
    search?: string
  ): void {
    this.isLoading = true;
    this.categoryService.fetchSubCategories(pageNumber, pageSize, search).subscribe({
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
      },
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

          return this.categoryService
            .fetchSubCategories(this.currentPage, this.pageSize, searchTerm)
            .pipe(
              catchError((error) => {
                console.error('Error fetching sub-categories:', error);
                return EMPTY;
              }),
              finalize(() => {
                this.isLoading = false;
              }),
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
    const subCategory = event.row as SubCategoryList;
    if (event.action === 'edit') {
      // Edit 
    } else if (event.action === 'delete') {
      // Delete
    }
  }

  resetSearch(): void {
    this.searchControl.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
