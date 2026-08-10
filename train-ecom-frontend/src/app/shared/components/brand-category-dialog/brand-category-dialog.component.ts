import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface BrandCategoryDialogData {
  title: string;
  type: 'Brand' | 'Category';
  isEdit: boolean;
  initialData?: { name: string; description: string };
}

@Component({
  selector: 'app-brand-category-dialog',
  templateUrl: './brand-category-dialog.component.html',
  styleUrl: './brand-category-dialog.component.css'
})
export class BrandCategoryDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<BrandCategoryDialogComponent>);

  form!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: BrandCategoryDialogData) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.initialData?.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.data.initialData?.description || '', [Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
