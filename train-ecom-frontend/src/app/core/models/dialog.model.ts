export interface FieldConfig{
    key: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'radio' | 'checkbox';
    validation?: any[];
    value?: any;
    maxLength?: number;
    required?: boolean;
}

export interface DialogData{
    title: string;
    fields: FieldConfig[];
    submitButtonText: string;
}