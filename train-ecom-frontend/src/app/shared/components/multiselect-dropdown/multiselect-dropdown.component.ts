import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DropdownOptions } from '../../../core/models/table.model';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.css'
})
export class MultiselectDropdownComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'search..';
  @Input() options: DropdownOptions[] = [];
  @Input() selectedValues: (string | number)[] = [];
  @Input() isLoading: boolean = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<DropdownOptions>();
  @Output() scrollToBottom = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<void>(); 
  @Output() clearFilters = new EventEmitter<void>();

  searchControl: FormControl<string | null> = new FormControl('');
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((searchTerm) => {
      this.searchChange.emit(searchTerm || '');
    });
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
