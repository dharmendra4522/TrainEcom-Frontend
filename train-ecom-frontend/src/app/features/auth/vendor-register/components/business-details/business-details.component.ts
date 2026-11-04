import { loadPaginatedBrandsSuccess } from './../../../../../core/store/brand/brand.action';
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Category } from '../../../../../core/models/category.model';
import { getFieldError, trimControlValue } from '../../../register.utils';
import { Store } from '@ngrx/store';
import * as CategoryActions from '../../../../../core/store/category/category.action'

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrl: './business-details.component.css',
})
export class BusinessDetailsComponent implements OnInit, OnDestroy {
  private store = inject(Store);

  @Input() registerForm!: FormGroup;
  @Input() categories$!: Observable<Category[]>;
  @Input() isStep2Valid: boolean = false;
  @Input() isEditMode: boolean = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  public categoryFilter: FormControl = new FormControl('');
  public allCategories: Category[] = [];
  public filteredCategories: Category[] = [];

  private destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this.categoryFilter.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(search => {
      const searchTerm = search?.toLowerCase().trim() || undefined;
      this.store.dispatch(CategoryActions.loadPaginatedCategories({ pageNumber: 1, pageSize: 10, search: searchTerm, refresh: true }));
    })
    // Categories stream ko subscribe karke local array mein save karein
    if (this.categories$) {
      this.categories$.pipe(takeUntil(this.destroy$)).subscribe((cats) => {
        this.allCategories = cats || [];
        this.filteredCategories = this.allCategories;
      });
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPrev(): void {
    this.prev.emit();
  }
  onNext(): void {
    this.next.emit();
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.registerForm.get(controlName);
    return getFieldError(control, label);
  }

  onBlurTrim(controlName: string): void {
    const control = this.registerForm.get(controlName);
    trimControlValue(control);
  }

  // clear filter input
  clearCategoryFilter(event: MouseEvent): void {
    event.stopPropagation();
    this.categoryFilter.setValue('');
  }
  // handle category selection
  clearAllCategories(event: MouseEvent): void {
    event.stopPropagation();
    this.registerForm.get('businessCategory')?.setValue([]);
    this.registerForm.get('businessCategory')?.markAsTouched();
  }
}