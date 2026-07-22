import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, } from '@angular/material/dialog';
import { DialogData } from '../../../core/models/dialog.model';

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.css'
})
export class GenericDialogComponent {
  private fb = inject(FormBuilder);
  dynamicForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<GenericDialogComponent>
  ) { }

  ngOnInit(): void {
    this.buildDynamicForm();
  }

  buildDynamicForm(): void {
    const group: any = {};
    this.data.fields.forEach(field => {
      let defaultValue = field.value !== undefined ? field.value : (field.type === 'checkbox' ? false : '');
      let validations = field.validation || [];
      if (field.required) {
        validations = [...validations, Validators.required];
      }
      group[field.key] = [defaultValue, validations];
    });
    this.dynamicForm = this.fb.group(group);
  }

  
  onSubmit(): void {
    if (this.dynamicForm.valid) {
      this.dialogRef.close(this.dynamicForm.value);
    }
  }
}
