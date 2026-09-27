import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Category } from '../../../../../core/models/category.model';
import { getFieldError, trimControlValue } from '../../../register.utils';

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrl: './business-details.component.css',
})
export class BusinessDetailsComponent implements OnInit, OnDestroy {
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
    // Categories stream ko subscribe karke local array mein save karein
    if (this.categories$) {
      this.categories$.pipe(takeUntil(this.destroy$)).subscribe((cats) => {
        this.allCategories = cats || [];
        this.filteredCategories = this.allCategories;
      });
    }

    // Search input change hone par list filter karein
    this.categoryFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.filterCategories(searchTerm);
      });
  }

  private filterCategories(search: string): void {
    if (!search) {
      this.filteredCategories = this.allCategories;
      return;
    }
    const filterValue = search.toLowerCase();
    this.filteredCategories = this.allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(filterValue)
    );
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
}