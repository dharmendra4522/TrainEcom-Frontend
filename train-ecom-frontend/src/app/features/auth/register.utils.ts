import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { VendorRegisterFormValues } from '../../core/models/auth.model';

// pasword match validator
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPasswordControl = control.get('confirmPassword');
  const confirmPassword = confirmPasswordControl?.value;

  if (!confirmPasswordControl) {
    return null;
  }

  if (password !== confirmPassword && confirmPassword) {
    confirmPasswordControl.setErrors({
      ...confirmPasswordControl.errors,
      passwordMismatch: true,
    });
    return { passwordMismatch: true };
  } else {
    if (confirmPasswordControl.hasError('passwordMismatch')) {
      const errors = { ...confirmPasswordControl.errors };
      delete errors['passwordMismatch'];
      confirmPasswordControl.setErrors(
        Object.keys(errors).length > 0 ? errors : null,
      );
    }
    return null;
  }
};

// document validator
export const fileValidator = (
  allowedType: string[],
  maxSize: number,
): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file instanceof File) {
      const fileSize = file.size / (1024 * 1024);
      if (fileSize > maxSize) {
        return { maxFilesize: true };
      }
      if (!allowedType.includes(file.type)) {
        return { invalidFileType: true };
      }
    }
    return null;
  };
};

// handle empty state validator
export function noSpaceAllow(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || typeof value !== 'string') {
      return null;
    }
    if (value.trim().length === 0) {
      return { onlySpace: true };
    }

    return null;
  };
}


// handle vendor multipart form data
export function createVendorFormData(
  formValue: VendorRegisterFormValues,
): FormData {
  const formData = new FormData();
  const fullName = `${formValue.firstName.trim()} ${formValue.lastName.trim()}`;

  formData.append('Name', fullName);
  formData.append('Email', formValue.email);
  formData.append('Password', formValue.password);
  formData.append('ConfirmPassword', formValue.confirmPassword);
  formData.append('PhoneNumber', formValue.phoneNumber);
  formData.append('Role', String(2));

  formData.append('BussinessDetails.BussinessName', formValue.businessName);
  formData.append('BussinessDetails.BussinessDescription', formValue.bussinessDescription);
  formData.append('BussinessDetails.StoreName', formValue.displayName);
  formData.append('BussinessDetails.GSTIN', formValue.gstin);
  formData.append('BussinessDetails.PAN', formValue.panNumber);
  formData.append('BussinessDetails.AddressLine1', formValue.addressLine1);
  if (formValue.addressLine2) {
    formData.append('BussinessDetails.AddressLine2', formValue.addressLine2);
  }
  formData.append('BussinessDetails.City', formValue.city);
  formData.append('BussinessDetails.State', formValue.state);
  formData.append('BussinessDetails.Country', formValue.country);
  formData.append('BussinessDetails.PostalCode', formValue.postalCode);
  if (formValue.bankAccountNumber) {
    formData.append('BussinessDetails.BankAccountNumber', formValue.bankAccountNumber.toString());
  }
  if (formValue.ifscCode) {
    formData.append('BussinessDetails.IFSCCode', formValue.ifscCode);
  }
  if (formValue.acountHolderName) {
    formData.append('BussinessDetails.AccountHolderName', formValue.acountHolderName);
  }

  const categories: string[] = Array.isArray(formValue.businessCategory)
    ? formValue.businessCategory
    : [formValue.businessCategory];
  categories.forEach((catId: string) => {
    const parsed = Number(catId);
    if (Number.isInteger(parsed)) {
      formData.append('BussinessDetails.CategoryIds', String(parsed));
    }
  });

  if (formValue.gstDocument instanceof File) {
    formData.append('BussinessDetails.GSTDocument', formValue.gstDocument);
  }
  if (formValue.businessDocument instanceof File) {
    formData.append('BussinessDetails.BussinessDocument', formValue.businessDocument);
  }
  if (formValue.businessLogo instanceof File) {
    formData.append('BussinessDetails.Logo', formValue.businessLogo);
  }

  return formData;
}


// handle input field validation error message
export function getFieldError(
  control: AbstractControl | null,
  fieldLabel: string,
): string {
  if (!control || !control.errors || (!control.dirty && !control.touched)) {
    return '';
  }

  const errors = control.errors;

  if (errors['required']) {
    return `${fieldLabel} is required.`;
  }
  if (errors['onlySpace']) {
    return `Only spaces are not allowed for ${fieldLabel}.`;
  }
  if (errors['minlength']) {
    return `${fieldLabel} must be at least ${errors['minlength'].requiredLength} characters long.`;
  }
  if (errors['email']) {
    return `Enter a valid email address.`;
  }
  if (errors['pattern']) {
    if (fieldLabel.toLowerCase().includes('phone')) {
      return 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
    }
    if (fieldLabel.toLowerCase().includes('password')) {
      return 'Use uppercase, lowercase, number, and special character.';
    }
    if (fieldLabel.toLowerCase().includes('postal')) {
      return 'Enter a valid 6-digit postal code (cannot start with all zeros).';
    }
    if (fieldLabel.toLowerCase().includes('gstin')) {
      return 'Enter a valid GSTIN format.';
    }
    if (fieldLabel.toLowerCase().includes('pan')) {
      return 'Enter a valid PAN card format (e.g., ABCDE1234F).';
    }
    if (fieldLabel.toLowerCase().includes('ifsc')) {
      return 'Enter a valid IFSC code format.';
    }
    return `${fieldLabel} format is invalid.`;
  }
  if (errors['passwordMismatch']) {
    return `Passwords do not match.`;
  }
  if (errors['fileSize']) {
    return `File size exceeds the maximum limit.`;
  }
  if (errors['fileType']) {
    return `Invalid file format.`;
  }
  if (errors['maxFilesize']) {
    return `File size must not exceed 5MB.`;
  }
  if (errors['invalidFileType']) {
    if (fieldLabel.toLowerCase().includes('logo')) {
      return `Please upload a valid image (JPEG, PNG, WEBP).`;
    }
    return `Please upload a valid PDF document.`;
  }

  return '';
}


// trim the input field's data
export function trimControlValue(control: AbstractControl | null): void {
  if (control && typeof control.value === 'string') {
    const trimedValue = control.value.trim();
    if (trimedValue !== control.value) {
      control.setValue(trimedValue, { emitEvent: false });
    }
  }
}
