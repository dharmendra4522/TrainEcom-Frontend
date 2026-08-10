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
  @Input() control!: FormControl;

  @Output() manageClicked = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl<string>('');
  private destroy$ = new Subject<void>();

  private innerValue: string | null = null;

  onChange: (value: string | null) => void = () => { };
  onTouched: () => void = () => { };

  //  Lifecycle hook: Initializes component subscriptions 
  ngOnInit(): void {
    this.setupSearchSubscription();
  }

  // Sets up reactive search filtering with debounce and distinct checks
  private setupSearchSubscription(): void {
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((term: string | null) => {
      this.search.emit(term || '');
    });
  }

  // Lifecycle hook: Cleans up subscriptions on component destruction
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Getter for internal form control value
  get value(): string | null {
    return this.innerValue;
  }

  // Setter for internal value that syncs changes with parent form
  set value(v: string | null) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  // Writes a new value to the component from the parent form
  writeValue(value: string | null): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  // Registers a callback function that is called when the control's value changes
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  // Registers a callback function that is called when the control is touched
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Handles manage button click inside dropdown panel and prevents default behavior
  onManageClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.manageClicked.emit();
  }
}