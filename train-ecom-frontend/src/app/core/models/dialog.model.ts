import { ValidatorFn } from '@angular/forms';

export interface FieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'tel'
    | 'select'
    | 'radio'
    | 'checkbox';
  validation?: ValidatorFn[];
  value?: string | number | boolean;
  maxLength?: number;
  required?: boolean;
  options?: SelectOption[];
}
 
export interface SelectOption {
  value: string | number;
  label: string;
}
 
export interface DialogData {
  title: string;
  fields: FieldConfig[];
  submitButtonText: string;
  enableCurrentLocation?: boolean;
}
