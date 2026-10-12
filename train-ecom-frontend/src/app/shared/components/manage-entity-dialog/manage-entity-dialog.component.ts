import { Component, Inject, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Brand } from '../../../core/models/brand.model';
import {
  Category,
  CreateCategoryRequest,
  SubCategoryList,
  UpdateCategoryRequest,
} from '../../../core/models/category.model';
import { Actions, ofType } from '@ngrx/effects';
import { selectBrandLoading } from '../../../core/store/brand/brand.selectors';
import { selectCategoryLoading } from '../../../core/store/category/category.selectors';
import * as BrandActions from '../../../core/store/brand/brand.action';
import * as CategoryActions from '../../../core/store/category/category.action';
import { BrandCategoryDialogComponent } from '../brand-category-dialog/brand-category-dialog.component';
import { ConfirmDialogServiceService } from '../../../core/services/confirm-dialog.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BrandCategoryDialogData, BrandCategoryDialogResult } from '../brand-category-dialog/brand-category-dialog.component';

interface ManagedCategory extends Category {
  parentCategoryId?: number | string | null;
}

type ManagedEntity = Brand | ManagedCategory;

export interface ManageEntityDialogData {
  type: 'Brand' | 'Category' | 'Sub-Category';
  parentCategoryId?: number | string;
}

@Component({
  selector: 'app-manage-entity-dialog',
  templateUrl: './manage-entity-dialog.component.html',
  styleUrl: './manage-entity-dialog.component.css',
})
export class ManageEntityDialogComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer?: ElementRef<HTMLElement>;

  private store = inject(Store);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();
  private actions$ = inject(Actions);

  items$ = new BehaviorSubject<ManagedEntity[]>([]);
  localItems: ManagedEntity[] = [];
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  isFetching = false;
  hasMore = true;

  isLoading$: Observable<boolean> | null = null;
  displayedColumns: string[] = ['name', 'actions'];

  //Returns dynamic dialog title based on entity type
  get entityTitle(): string {
    if (this.data.type === 'Sub-Category') {
      return 'Sub-Categories';
    }
    return this.data.type === 'Category' ? 'Categories' : 'Brands';
  }

  constructor(
    public dialogRef: MatDialogRef<ManageEntityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ManageEntityDialogData,
  ) { }

  //Lifecycle hook: Initializes component data and listeners 
  ngOnInit(): void {
    this.initializeEntityLoadingState();
    this.setupActionListeners();
    this.loadInitialData();
  }

  // Sets up loading state selector based on entity type 
  private initializeEntityLoadingState(): void {
    if (this.data.type === 'Brand') {
      this.isLoading$ = this.store.select(selectBrandLoading);
    } else if (this.data.type === 'Category') {
      this.isLoading$ = this.store.select(selectCategoryLoading);
    }
  }

  //Triggers initial data fetch based on entity type
  private loadInitialData(): void {
    if (this.data.type === 'Brand') {
      this.fetchBrands();
    } else if (this.data.type === 'Category') {
      this.fetchCategories();
    } else {
      this.fetchSubCategories();
    }
  }

  //Listens to success and failure actions for both Brand and Category
  private setupActionListeners(): void {
    if (this.data.type === 'Brand') {
      this.actions$.pipe(
        ofType(BrandActions.loadPaginatedBrandsSuccess),
        takeUntil(this.destroy$)
      ).subscribe(({ brands, pageNumber, totalPages, totalRecords }) => {
        this.handlePaginatedSuccess(brands, pageNumber, totalPages, totalRecords);
      });

      this.actions$.pipe(
        ofType(BrandActions.loadPaginatedBrandsFailure),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.isFetching = false;
      });
    } else if (this.data.type === 'Category') {
      this.actions$.pipe(
        ofType(CategoryActions.loadPaginatedCategoriesSuccess),
        takeUntil(this.destroy$)
      ).subscribe(({ categories, pageNumber, totalPages, totalRecords }) => {
        this.handlePaginatedSuccess(categories, pageNumber, totalPages, totalRecords);
      });

      this.actions$.pipe(
        ofType(CategoryActions.loadPaginatedCategoriesFailure),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.isFetching = false;
      });
    }
  }

  // Common handler for paginated success response to update items list
  private handlePaginatedSuccess(
    fetchedItems: ManagedEntity[],
    pageNumber: number,
    totalPages: number,
    totalRecords: number
  ): void {
    this.isFetching = false;
    this.totalRecords = totalRecords;
    this.hasMore = pageNumber < totalPages && fetchedItems.length > 0;

    if (pageNumber === 1) {
      this.localItems = fetchedItems;
    } else {
      const existingIds = new Set(this.localItems.map(item => item.id));
      const newItems = fetchedItems.filter(item => !existingIds.has(item.id));
      this.localItems = [...this.localItems, ...newItems];
    }
    this.items$.next(this.localItems);
    this.checkAndFetchNextPageIfNeeded();
  }

  // Dispatches action to fetch paginated brands
  fetchBrands(): void {
    if (this.isFetching) return;
    this.isFetching = true;
    this.store.dispatch(BrandActions.loadPaginatedBrands({ pageNumber: this.currentPage, pageSize: this.pageSize }));
  }

  // Dispatches action to fetch paginated categories 
  fetchCategories(): void {
    if (this.isFetching) return;
    this.isFetching = true;
    this.store.dispatch(CategoryActions.loadPaginatedCategories({ pageNumber: this.currentPage, pageSize: this.pageSize }));
  }

  private fetchSubCategories(): void {
    const parentCategoryId = this.data.parentCategoryId;
    if (this.isFetching || parentCategoryId === undefined) return;

    this.isFetching = true;
    this.categoryService
      .fetchSubCategories(this.currentPage, this.pageSize, undefined, parentCategoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const subCategories: ManagedCategory[] = response.items.map(
            (item: SubCategoryList) => ({
              id: item.id,
              name: item.subCategoryName,
              description: item.description,
              parentCategoryId: item.parentCategoryId ?? parentCategoryId,
            }),
          );
          this.handlePaginatedSuccess(
            subCategories,
            response.pageNumber,
            response.totalPages,
            response.totalRecords,
          );
        },
        error: (error: unknown) => {
          this.isFetching = false;
          console.error('Error fetching subcategories:', error);
          this.notificationService.showError('Failed to load sub-categories.');
        },
      });
  }

  // Handles scroll event on dialog content for infinite scrolling
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const threshold = 30;
    const isAtBottom = Math.ceil(target.scrollTop) + target.clientHeight >= target.scrollHeight - threshold;

    if (isAtBottom && !this.isFetching && this.hasMore) {
      this.currentPage++;
      this.loadMoreItems();
    }
  }

  // Triggers fetch for the next page based on entity type 
  private loadMoreItems(): void {
    if (this.data.type === 'Brand') {
      this.fetchBrands();
    } else if (this.data.type === 'Category') {
      this.fetchCategories();
    } else {
      this.fetchSubCategories();
    }
  }

  // Automatically fetches next page if initial content doesn't fill the container height
  private checkAndFetchNextPageIfNeeded(): void {
    setTimeout(() => {
      if (!this.scrollContainer || this.isFetching || !this.hasMore) return;
      const el = this.scrollContainer.nativeElement;
      if (el.scrollHeight <= el.clientHeight) {
        this.currentPage++;
        this.loadMoreItems();
      }
    }, 100);
  }

  // Lifecycle hook: Cleans up subscriptions on destroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Opens dialog to add a new entity
  onAdd(): void {
    this.openAddEditDialog();
  }

  // Opens dialog to edit an existing entity
  onEdit(item: ManagedEntity): void {
    this.openAddEditDialog(item);
  }

  // Prompts confirmation and deletes selected entity
  onDelete(id: number): void {
    this.confirmDialog
      .confirm(
        `Are you sure you want to delete this ${this.data.type}?`,
        'Delete',
        'Cancel',
      )
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          if (this.data.type === 'Sub-Category') {
            this.categoryService
              .deleteCategory(id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.notificationService.showSuccess(
                    'Sub-category deleted successfully.'
                  );
                  this.refreshSubCategories();
                },
                error: (error: unknown) => {
                  console.error('Error deleting subcategory:', error);
                  this.notificationService.showError(
                    'Failed to delete sub-category.'
                  );
                }
              });
          } else {
            this.dispatchDeleteAction(id);
            this.removeDeletedItemLocally(id);
          }
        }
      });
  }

  // Dispatches delete action to NgRx store based on entity type
  private dispatchDeleteAction(id: number): void {
    if (this.data.type === 'Brand') {
      this.store.dispatch(BrandActions.deleteBrand({ brandId: id }));
    } else {
      this.store.dispatch(CategoryActions.deleteCategory({ categoryId: id }));
    }
  }

  // Updates local array state and checks if more data needs fetching after deletion
  private removeDeletedItemLocally(id: string | number): void {
    this.localItems = this.localItems.filter(item => String(item.id) !== String(id));
    this.items$.next(this.localItems);
    this.totalRecords = Math.max(0, this.totalRecords - 1);
    this.checkAndFetchNextPageIfNeeded();
  }

  // Opens BrandCategoryDialog for creating or updating items
  private openAddEditDialog(item?: ManagedEntity): void {
    const isEdit = !!item;
    const initialData: BrandCategoryDialogData['initialData'] = item
      ? {
          name: item.name,
          description: item.description,
          ...(this.data.type === 'Sub-Category'
            ? { parentCategoryId: (item as ManagedCategory).parentCategoryId }
            : {}),
        }
      : this.data.type === 'Sub-Category'
        ? { name: '', description: '', parentCategoryId: this.data.parentCategoryId }
        : undefined;
    const dialogData: BrandCategoryDialogData = {
      title: isEdit ? `Edit ${this.data.type}` : `Add ${this.data.type}`,
      type: this.data.type,
      isEdit,
      initialData,
    };
    const dialogRef = this.dialog.open<
      BrandCategoryDialogComponent,
      BrandCategoryDialogData,
      BrandCategoryDialogResult
    >(BrandCategoryDialogComponent, {
      width: '500px',
      disableClose: true,
      data: dialogData
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          if (isEdit && item) {
            this.handleEntityUpdate(item, result);
          } else {
            this.handleEntityCreation(result);
          }
        }
      });
  }

  // Dispatches update action and updates local items array
  private handleEntityUpdate(item: ManagedEntity, result: BrandCategoryDialogResult): void {
    if (this.data.type === 'Brand') {
      this.store.dispatch(
        BrandActions.updateBrand({
          brandId: item.id,
          brand: result as Brand
        }),
      );
    } else if (this.data.type === 'Sub-Category') {
      const parentCategoryId =
        result.parentCategoryId ?? this.data.parentCategoryId;
      const payload: UpdateCategoryRequest = {
        name: result.name,
        description: result.description,
        parentCategoryId:
          parentCategoryId === undefined || parentCategoryId === null
            ? null
            : Number(parentCategoryId),
      };
      this.categoryService
        .updateCategory(item.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess(
              'Sub-category updated successfully.',
            );
            this.refreshSubCategories();
          },
          error: (error: unknown) => {
            console.error('Error updating subcategory:', error);
            this.notificationService.showError(
              'Failed to update sub-category.',
            );
          },
        });
      return;
    } else {
      this.store.dispatch(
        CategoryActions.updateCategory({
          categoryId: item.id,
          category: {
            name: result.name,
            description: result.description ?? item.description,
          },
        }),
      );
    }
    this.localItems = this.localItems.map(i => i.id === item.id ? { ...i, ...result } : i);
    this.items$.next(this.localItems);
  }

  // Dispatches create action and handles success response to close dialog with ID
  private handleEntityCreation(result: BrandCategoryDialogResult): void {
    if (this.data.type === 'Brand') {
      this.store.dispatch(
        BrandActions.createBrand({ brand: result as Brand }),
      );
      this.actions$.pipe(
        ofType(BrandActions.createBrandSuccess),
        takeUntil(this.destroy$)
      ).subscribe(({ brand }) => {
        if (brand && brand.id) {
          // when a new brand is created, we add it to the top of the localItems list and update the BehaviorSubject
          this.localItems = [brand, ...this.localItems];
          this.items$.next(this.localItems);
          this.dialogRef.close(brand.id);
        }
      });
    } else if (this.data.type === 'Sub-Category') {
      const parentCategoryId = result.parentCategoryId ?? this.data.parentCategoryId;
      if (parentCategoryId === undefined || parentCategoryId === null) {
        return;
      }

      const payload: CreateCategoryRequest = {
        name: result.name,
        description: result.description,
        parentCategoryId: Number(parentCategoryId),
      };
      this.categoryService
        .createCategory(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (category) => {
            this.notificationService.showSuccess(
              'Sub-category created successfully.',
            );
            this.dialogRef.close(category.id);
          },
          error: (error: unknown) => {
            console.error('Error creating subcategory:', error);
            this.notificationService.showError(
              'Failed to create sub-category.',
            );
          },
        });
    } else {
      this.store.dispatch(
        CategoryActions.createCategory({
          category: result as Category,
        }),
      );
      this.actions$.pipe(
        ofType(CategoryActions.createCategorySuccess),
        takeUntil(this.destroy$)
      ).subscribe(({ category }) => {
        if (category && category.id) {
          this.dialogRef.close(category.id);
        }
      });
    }
  }

  private refreshSubCategories(): void {
    this.currentPage = 1;
    this.localItems = [];
    this.items$.next([]);
    this.fetchSubCategories();
  }
}