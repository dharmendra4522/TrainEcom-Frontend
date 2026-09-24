import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Category } from '../../../../../core/models/category.model';
import { getFieldError, trimControlValue } from '../../../register.utils';

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrl: './business-details.component.css',
})
export class BusinessDetailsComponent {
  @Input() registerForm!: FormGroup;
  @Input() categories$!: Observable<Category[]>;
  @Input() isStep2Valid: boolean = false;
  @Input() isEditMode: boolean = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

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
