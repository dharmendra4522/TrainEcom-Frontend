import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, startWith } from 'rxjs/operators';

export interface DropdownItem {
  [key: string]: unknown;
}

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrl: './searchable-dropdown.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableDropdownComponent),
      multi: true
    }
  ]
})
export class SearchableDropdownComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label: string = 'Select Item';
  @Input() placeholder: string = 'Select...';
  @Input() items: DropdownItem[] = [];
  @Input() displayKey: string = 'name';
  @Input() valueKey: string = 'id';
  @Input() type: string = 'Item';
  @Input() errorMsg: string = 'Selection is required';
  @Input() control!: FormControl; // Passed from parent to show errors correctly

  @Output() manageClicked = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();
  
  // Internal value
  private innerValue: string | null = null;

  onChange: (value: string | null) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.search.emit(term || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get value(): string | null {
    return this.innerValue;
  }

  set value(v: string | null) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  writeValue(value: string | null): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onManageClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.manageClicked.emit();
  }
}
