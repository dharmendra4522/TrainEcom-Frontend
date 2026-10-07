import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownOptions } from '../../../core/models/table.model';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.css'
})
export class MultiselectDropdownComponent {
  @Input() placeholder: string = 'search..';
  @Input() options: DropdownOptions[] = [];
  @Input() selectedValues: (string | number)[] = [];
  @Input() isLoading: boolean = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<DropdownOptions>();
  @Output() scrollToBottom = new EventEmitter<void>();

  searchControl: FormControl<string | null> = new FormControl('');

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.searchChange.emit(value || '');
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


}
