import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DropdownOptions } from '../../../core/models/table.model';
import { FormControl } from '@angular/forms';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Range {
  min: number;
  max: number;
}

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.css',
})
export class MultiselectDropdownComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() placeholder: string = 'search..';
  @Input() options: DropdownOptions[] = [];
  @Input() selectedValues: (string | number)[] = [];
  @Input() isLoading: boolean = false;
  @Input() isPriceRange: boolean = false;
  @Input() isStockRange: boolean = false;
  @Input() priceMin: number = 0;
  @Input() priceMax: number = 10000;
  @Input() stockMin: number = 0;
  @Input() stockMax: number = 500;
  @Input() canApply = false;
  @Input() canClear = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<DropdownOptions>();
  @Output() scrollToBottom = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() priceRangeChange = new EventEmitter<Range>();
  @Output() stockRangeChange = new EventEmitter<Range>();

  searchControl: FormControl<string | null> = new FormControl('');
  selectedMin = 0;
  selectedMax = 0;
  activeRangeThumb: 'min' | 'max' = 'max';
  private readonly destroy$ = new Subject<void>();
  private readonly priceRangeChanges$ = new Subject<Range>();

  ngOnInit(): void {
    this.setupSearch();
    this.setupPriceRangeChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['isStockRange'] ||
      changes['priceMin'] ||
      changes['priceMax'] ||
      changes['stockMin'] ||
      changes['stockMax']
    ) {
      this.selectedMin = this.minRange;
      this.selectedMax = this.maxRange;
    }
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchChange.emit(searchTerm || '');
      });
  }

  private setupPriceRangeChanges(): void {
    this.priceRangeChanges$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (previous, current) =>
            previous.min === current.min && previous.max === current.max,
        ),
        switchMap((range): Observable<Range> => of(range)),
        takeUntil(this.destroy$),
      )
      .subscribe((range) => {
        if (this.isStockRange) {
          this.stockRangeChange.emit(range);
          return;
        }

        this.priceRangeChange.emit(range);
      });
  }

  updatePriceRange(min: number, max: number): void {
    this.selectedMin = min;
    this.selectedMax = max;
    this.priceRangeChanges$.next({ min, max });
  }

  onPriceMinChange(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const min = Math.min(Number(input.value), this.selectedMax);
    this.updatePriceRange(min, this.selectedMax);
  }

  onPriceMaxChange(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const max = Math.max(Number(input.value), this.selectedMin);
    this.updatePriceRange(this.selectedMin, max);
  }

  setActiveRangeThumb(thumb: 'min' | 'max'): void {
    this.activeRangeThumb = thumb;
  }

  get minRange(): number {
    return this.isStockRange ? this.stockMin : this.priceMin;
  }

  get maxRange(): number {
    return this.isStockRange ? this.stockMax : this.priceMax;
  }

  // clear the search input
  clearSearch(event: Event): void {
    event.stopPropagation();
    this.searchControl.setValue('');
  }

  // checkbox selection toggle
  toggleSelection(options: DropdownOptions, event: Event): void {
    event.stopPropagation();
    this.selectionChange.emit(options);
  }

  isChecked(optiobId: number | string): boolean {
    return this.selectedValues.includes(optiobId);
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 15) {
      this.scrollToBottom.emit();
    }
  }

  onApply(event: Event): void {
    event.stopPropagation();
    this.applyFilters.emit();
  }

  onClearAll(event: Event): void {
    event.stopPropagation();
    this.searchControl.setValue('');
    if (this.isPriceRange || this.isStockRange) {
      this.selectedMin = this.minRange;
      this.selectedMax = this.maxRange;
    }
    this.clearFilters.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
