import { passwordMatchValidator } from './../../../auth/register.utils';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UpdateProfilePayload, UserProfile } from '../../../../core/models/user.model';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Role } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
})
export class ProfileEditComponent {
  private fb = inject(FormBuilder);
  private useService = inject(UserService);
  private notification = inject(NotificationService);

  @Input() userProfile: UserProfile | null = null;
  @Input() userRole: Role | null = null;
  @Output() isCancleEdit = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<void>();

  profileForm!: FormGroup;
  isChangePasswordMode: boolean = false;
  roleEnum = Role;

  ngOnInit() {
    this.initializeForm();
    if (this.userProfile) {
      this.patchformWithUserProfile(this.userProfile);
    }
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      // Vendor fields
      businessName: [''],
      storeName: [''],
      businessDescription: [''],
      gstin: [''],
      pan: [''],
      bankAccountNumber: [''],
      ifscCode: [''],
      accountHolderName: [''],
      // Customer Address fields
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: [''],
      // Password fields
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  // patch form with user profile data
  private patchformWithUserProfile(profile: UserProfile): void {
    this.profileForm.patchValue({
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      businessName: profile.vendorDetails?.businessName,
      storeName: profile.vendorDetails?.storeName,
      businessDescription: profile.vendorDetails?.businessDescription,
      gstin: profile.vendorDetails?.gstin,
      pan: profile.vendorDetails?.pan,
      bankAccountNumber: profile.vendorDetails?.bankAccountNumber,
      ifscCode: profile.vendorDetails?.ifscCode,
      accountHolderName: profile.vendorDetails?.accountHolderName,
      addressLine1: profile.defaultAddress?.addressLine1 || profile.vendorDetails?.addressLine1,
      addressLine2: profile.defaultAddress?.addressLine2 || profile.vendorDetails?.addressLine2,
      city: profile.defaultAddress?.city || profile.vendorDetails?.city,
      state: profile.defaultAddress?.state || profile.vendorDetails?.state,
      country: profile.defaultAddress?.country || profile.vendorDetails?.country,
      postalCode: profile.defaultAddress?.postalCode || profile.vendorDetails?.postalCode
    });
  }

  // password match validator fix (correcting 'password' to 'newPassword')
  private passwordMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const password = control.get('newPassword')?.value;
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

  togglePasswordFields(): void {
    this.isChangePasswordMode = !this.isChangePasswordMode;
    if (!this.isChangePasswordMode) {
      this.profileForm.patchValue({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  onCancel(): void {
    this.isCancleEdit.emit();
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.profileForm.getRawValue();
    
    const payload: UpdateProfilePayload = {
      name: formValue.name,
      phoneNumber: formValue.phoneNumber,
    };

    if (this.userRole === Role.Vendor && this.userProfile?.vendorDetails) {
      payload.VendorDetails = {
        businessName: formValue.businessName,
        storeName: formValue.storeName,
        businessDescription: formValue.businessDescription,
        gstin: formValue.gstin,
        pan: formValue.pan,
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2,
        city: formValue.city,
        state: formValue.state,
        country: formValue.country,
        postalCode: formValue.postalCode,
        bankAccountNumber: formValue.bankAccountNumber,
        ifscCode: formValue.ifscCode,
        accountHolderName: formValue.accountHolderName,
        documentUrls: this.userProfile.vendorDetails.documentUrls,
        categories: this.userProfile.vendorDetails.categories
      };
    } else if (this.userRole === Role.Customer) {
      payload.defaultAddress = {
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2,
        city: formValue.city,
        state: formValue.state,
        country: formValue.country,
        postalCode: formValue.postalCode
      };
    }

    if (this.isChangePasswordMode && formValue.oldPassword) {
      payload.oldPassword = formValue.oldPassword;
      payload.newPassword = formValue.newPassword;
      payload.confirmPassword = formValue.confirmPassword;
    }

    this.useService.updateUserProfile(payload).subscribe({
      next: () => {
        this.notification.showSuccess('Profile updated successfully', 'Close');
        this.profileUpdated.emit();
      }, 
      error: (error) => {
        const errorMessage = error?.error?.message || 'Failed to update profile. Please try again.';
        this.notification.showError(errorMessage, 'Close');
      }
    });
  }
}