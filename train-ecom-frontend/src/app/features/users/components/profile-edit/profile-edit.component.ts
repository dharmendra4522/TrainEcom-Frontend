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
  selectedImage: File | null = null;
  private readonly allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  private readonly maxFileSize = 3 * 1024 * 1024;

  ngOnInit() {
    this.initializeForm();
    if (this.userProfile) {
      this.patchFormWithUserProfile(this.userProfile);
    }
    this.setupFormChange();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group(
      {
        name: ['', [Validators.required, noSpaceAllow(), Validators.pattern(/^[a-zA-Z\s]+$/)]],
        email: [{ value: '', disabled: true }],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        profileImage: [''],

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
      profileImage: profile.profileImage,
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

      const isBasicInfoChanged =
        formvalue.name !== this.userProfile?.name ||
        formvalue.phoneNumber !== this.userProfile?.phoneNumber ||
        formvalue.profileImage !== this.userProfile?.profileImage;

      const isPasswordEntered = !!formvalue.oldPassword || !!formvalue.newPassword || !!formvalue.confirmPassword;

      this.isFormChanged = isBasicInfoChanged || isPasswordEntered;
    });
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
    const payload: UpdateProfilePayload = {};
    if (formValue.name !== this.userProfile?.name) {
      payload.name = formValue.name;
    }
    if (formValue.phoneNumber !== this.userProfile?.phoneNumber) {
      payload.phoneNumber = formValue.phoneNumber;
    }
    if (this.selectedImage) {
      payload.profileImage = this.selectedImage;
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

  // handle image selection and validate the selected file
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    if (!this.allowedTypes.includes(file.type)) {
      this.notification.showError(
        'Only JPG, JPEG, PNG and WEBP images are allowed'
      );
      return;
    }
    if (file.size > this.maxFileSize) {
      this.notification.showError('Image size must be less than 2 MB');
      return;
    }
    this.selectedImage = file;
    this.isFormChanged = true;
  }
}
