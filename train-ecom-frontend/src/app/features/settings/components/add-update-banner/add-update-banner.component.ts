import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fileValidator, getFieldError, noSpaceAllow, trimControlValue } from '../../../auth/register.utils';
import { BannerService } from '../../../../core/services/banner.service';
import { Banner } from '../../../../core/models/setting.model';

@Component({
  selector: 'app-add-update-banner',
  templateUrl: './add-update-banner.component.html',
  styleUrl: './add-update-banner.component.css'
})
export class AddUpdateBannerComponent {
  private dialogRef = inject(MatDialogRef<AddUpdateBannerComponent>);
  private fb = inject(FormBuilder);
  private bannerService = inject(BannerService);
  // fetch data from parent component if available
  public data: Banner | null = inject(MAT_DIALOG_DATA, { optional: true }) as Banner | null;

  bannerForm!: FormGroup;
  selectedFileName: string | null = null;
  isLoading: boolean = false;

  get isEditMode(): boolean {
    return this.data !== null;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  // form Initialize
  private initializeForm(): void {
    this.bannerForm = this.fb.group({
      title: [this.data?.title || '', [Validators.required, Validators.maxLength(100), Validators.minLength(3),Validators.pattern(/^[a-zA-Z0-9\s\-_,&%!.]+$/), noSpaceAllow()]],
      bannerImage: [null, [
        ...(this.isEditMode ? [] : [Validators.required]),
        fileValidator(['image/jpeg', 'image/png', 'image/png', 'image/webp'], 5)
      ]],
      description: [this.data?.description || '', [Validators.maxLength(500), Validators.pattern(/^[a-zA-Z0-9\s\-_,&%!.]+$/), noSpaceAllow()]]
    })
  }

  // get error messages for form controls
  getErrorMessage(controlName: string, label: string): string {
    const control = this.bannerForm.get(controlName);
    if (controlName === 'bannerImage' && control?.hasError('invalidFileType')) {
      return 'Please select a JPEG, PNG, or WEBP image.';
    }
    return getFieldError(control, label);
  }

  // handle blur event to trim whitespace
  onBlurTrim(controlName: string): void {
    const control = this.bannerForm.get(controlName);
    trimControlValue(control);
  }

  // handle file selection
  onFileSelect(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0] ?? null;
    const control = this.bannerForm.get('bannerImage');

    this.selectedFileName = file?.name ?? null;
    control?.setValue(file);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }


  // handle form submission
  onSubmit(): void {
    this.bannerForm.markAllAsTouched();
    if (this.bannerForm.invalid || this.isLoading) {
      return;
    }
    this.isLoading = true;
    const formValues = this.bannerForm.getRawValue();
    const request$ = this.isEditMode
      ? this.bannerService.updateBanner(this.data!.id, formValues)
      : this.bannerService.createBanner(formValues);

    request$.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving banner:', error);
        this.dialogRef.close(false);
      }
    })
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
