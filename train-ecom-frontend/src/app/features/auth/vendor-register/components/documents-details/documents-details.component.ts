import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getFieldError, trimControlValue } from '../../../register.utils';

@Component({
  selector: 'app-documents-details',
  templateUrl: './documents-details.component.html',
  styleUrl: './documents-details.component.css',
})
export class DocumentsDetailsComponent {
  @Input() registerForm!: FormGroup;
  @Input() isLoading: boolean = false;
  @Input() isEditMode: boolean = false;

  @Output() fileSelect = new EventEmitter<{
    event: Event;
    controlName: string;
  }>();
  @Output() prev = new EventEmitter<void>();

  onFileSelect(event: Event, controlName: string) {
    this.fileSelect.emit({ event, controlName });
  }

  onPrev() {
    this.prev.emit();
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.registerForm.get(controlName);
    return getFieldError(control, label);
  }

}
