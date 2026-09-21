import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getFieldError, trimControlValue } from '../../../register.utils';

@Component({
  selector: 'app-tax-bank-details',
  templateUrl: './tax-bank-details.component.html',
  styleUrl: './tax-bank-details.component.css',
})
export class TaxBankDetailsComponent {
  @Input() registerForm!: FormGroup;
  @Input() isStep4Valid: boolean = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  onPrev() {
    this.prev.emit();
  }
  onNext() {
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
