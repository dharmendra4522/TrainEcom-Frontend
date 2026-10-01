import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  UpdateProfilePayload,
  UserProfile,
} from '../../../../core/models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Role } from '../../../../core/models/auth.model';
import { getFieldError, noSpaceAllow, passwordMatchValidator, trimControlValue } from './../../../auth/register.utils';

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
  hideOldPassword: boolean = true;
  hideNewPassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isFormChanged: boolean = false;

  ngOnInit() {
    this.initializeForm();
    if (this.userProfile) {
      this.patchFormWithUserProfile(this.userProfile);
    }
    this.setupFormChange();
    this.findInvalidControls();
  }

  findInvalidControls(): void {
    const invalid = Object.keys(this.profileForm.controls).filter(
      (name) => this.profileForm.controls[name].invalid
    );
    console.log('Invalid controls: ', invalid);
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group(
      {
        name: ['', [Validators.required, noSpaceAllow(), Validators.pattern(/^[a-zA-Z\s]+$/)]],
        email: [{ value: '', disabled: true }],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],

        // Password fields
        oldPassword: [''],
        newPassword: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
        confirmPassword: [''],
      },
      { validators: passwordMatchValidator }
    );
  }

  private patchFormWithUserProfile(profile: UserProfile): void {
    const address = profile.defaultAddress || profile.vendorDetails;
    const countryName = address?.country;
    const stateName = address?.state;

    this.profileForm.patchValue({
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      addressLine1: address?.addressLine1,
      addressLine2: address?.addressLine2,
      city: address?.city,
      state: stateName,
      country: countryName,
      postalCode: address?.postalCode,
    });
  }

  // track changes in the form and enable/disable the submit button accordingly
  private setupFormChange(): void {
    this.profileForm.valueChanges.subscribe(() => {
      const formvalue = this.profileForm.value;

      const isBasicInfoChanged = formvalue.name !== this.userProfile?.name ||
        formvalue.phoneNumber !== this.userProfile?.phoneNumber;

      const isPasswordEntered = !!formvalue.oldPassword || !!formvalue.newPassword || !!formvalue.confirmPassword;

      this.isFormChanged = isBasicInfoChanged || isPasswordEntered;

    })
  }

  togglePasswordFields(): void {
    this.isChangePasswordMode = !this.isChangePasswordMode;
    if (!this.isChangePasswordMode) {
      this.profileForm.patchValue({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  onCancel(): void {
    this.isCancleEdit.emit();
  }

  public getErrorMessage(controlName: string, label: string): string {
    return getFieldError(this.profileForm.get(controlName), label);
  }


  // handle form submission and update user profile
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
      },
    });
  }

  toggleOldPasswordVisibility(): void {
    this.hideOldPassword = !this.hideOldPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

   onBlurTrim(controlName: string): void {
      const control = this.profileForm.get(controlName);
      trimControlValue(control);
    }
}