export interface FieldConfig{
    key: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'radio' | 'checkbox';
    validation?: any[];
    value?: any;
}

export interface DialogData{
    title: string;
    fields: FieldConfig[];
    submitButtonText: string;
}