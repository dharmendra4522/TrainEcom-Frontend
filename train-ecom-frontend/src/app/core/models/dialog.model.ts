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
  validation?: any[];
  value?: any;
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
}