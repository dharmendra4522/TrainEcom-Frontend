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

export interface PriceRange {
  min: number;
  max: number;
}

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.css',
})
export class MultiselectDropdownComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() placeholder: string = 'search..';
  @Input() options: DropdownOptions[] = [];
  @Input() selectedValues: (string | number)[] = [];
  @Input() isLoading: boolean = false;
  @Input() isPriceRange: boolean = false;
  @Input() priceMin: number = 0;
  @Input() priceMax: number = 10000;

  @Output() searchChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<DropdownOptions>();
  @Output() scrollToBottom = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() priceRangeChange = new EventEmitter<PriceRange>();

  searchControl: FormControl<string | null> = new FormControl('');
  selectedPriceMin = this.priceMin;
  selectedPriceMax = this.priceMax;
  private readonly destroy$ = new Subject<void>();
  private readonly priceRangeChanges$ = new Subject<PriceRange>();

  ngOnInit(): void {
    this.setupSearch();
    this.setupPriceRangeChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['priceMin'] || changes['priceMax']) {
      this.selectedPriceMin = this.priceMin;
      this.selectedPriceMax = this.priceMax;
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
        switchMap((range): Observable<PriceRange> => of(range)),
        takeUntil(this.destroy$),
      )
      .subscribe((range) => this.priceRangeChange.emit(range));
  }

  updatePriceRange(min: number, max: number): void {
    this.selectedPriceMin = min;
    this.selectedPriceMax = max;
    this.priceRangeChanges$.next({ min, max });
  }

  onPriceMinChange(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const min = Math.min(Number(input.value), this.selectedPriceMax);
    this.updatePriceRange(min, this.selectedPriceMax);
  }

  onPriceMaxChange(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const max = Math.max(Number(input.value), this.selectedPriceMin);
    this.updatePriceRange(this.selectedPriceMin, max);
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
    this.clearFilters.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
