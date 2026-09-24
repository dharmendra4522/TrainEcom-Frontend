import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getFieldError, noSpaceAllow, trimControlValue } from '../../../features/auth/register.utils';

@Component({
  selector: 'app-vendor-action-dialog',
  templateUrl: './vendor-action-dialog.component.html',
  styleUrl: './vendor-action-dialog.component.css',
})
export class VendorActionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<VendorActionDialogComponent>);

  form: FormGroup;
  title: string;
  isRejectAction: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      vendorName: string;
      actionType: 'reject' | 'block';
    },
  ) {
    this.isRejectAction = data.actionType === 'reject';
    this.title = this.isRejectAction
      ? `Reject ${data.vendorName}`
      : `Block ${data.vendorName}`;

    this.form = this.fb.group({
      message: ['', [Validators.required, noSpaceAllow()]],
    });
  }

  onBlurTrim(): void {
    trimControlValue(this.form.get('message'));
  }

  getErrorMessage(): string {
    return getFieldError(this.form.get('message'), 'Reason / Message');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      confirmed: true,
      message: this.form.value.message.trim(),
    });
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }
}