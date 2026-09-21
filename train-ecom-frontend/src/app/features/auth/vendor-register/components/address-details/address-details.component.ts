import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ICity, ICountry, IState } from 'country-state-city';
import { getFieldError, trimControlValue } from '../../../register.utils';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrl: './address-details.component.css',
})
export class AddressDetailsComponent {
  @Input() registerForm!: FormGroup;
  @Input() countries: ICountry[] = [];
  @Input() states: IState[] = [];
  @Input() cities: ICity[] = [];
  @Input() isStep3Valid: boolean = false;

  @Output() countryChange = new EventEmitter<MatSelectChange>();
  @Output() stateChange = new EventEmitter<MatSelectChange>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  onCountryChange(event: MatSelectChange): void {
    this.countryChange.emit(event);
  }

  onStateChange(event: MatSelectChange): void {
    this.stateChange.emit(event);
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

  onBlurTrim(contronName: string): void {
    const control = this.registerForm.get(contronName);
    trimControlValue(control);
  }
}
