export interface FieldConfig{
    key: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'radio' | 'checkbox';
    validation?: any[];
    value?: any;
    maxLength?: number;
}

export interface DialogData{
    title: string;
    fields: FieldConfig[];
    submitButtonText: string;
}