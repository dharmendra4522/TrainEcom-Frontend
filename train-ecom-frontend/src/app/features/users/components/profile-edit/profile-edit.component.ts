import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  UpdateProfilePayload,
  UserProfile,
} from '../../../../core/models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Role } from '../../../../core/models/auth.model';
import { City, Country, ICity, ICountry, IState, State } from 'country-state-city';
import { MatSelectChange } from '@angular/material/select';
import { getFieldError, noSpaceAllow, passwordMatchValidator } from './../../../auth/register.utils';

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

  countries: ICountry[] = Country.getAllCountries();
  states: IState[] = [];
  cities: ICity[] = [];

  ngOnInit() {
    this.initializeForm();
    if (this.userProfile) {
      this.patchFormWithUserProfile(this.userProfile);
    }
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
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
        email: [{ value: '', disabled: true }],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        
        // Vendor fields
        businessName: [{ value: '', disabled: true }],
        storeName: ['', [Validators.required, Validators.minLength(3)]],
        bussinessDescription: ['', [Validators.required, Validators.minLength(10), noSpaceAllow()]],
        gstin: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/)]],
        pan: [{ value: '', disabled: true }],
        bankAccountNumber: ['', [Validators.pattern(/^\d{9,18}$/)]],
        ifscCode: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
        accountHolderName: ['', [Validators.pattern(/^[a-zA-Z\s]+$/), noSpaceAllow()]],

        // Address fields
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],

        // Password fields
        oldPassword: [''],
        newPassword: ['', [Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
        confirmPassword: [''],
      },
      { validators: passwordMatchValidator }
    );
  }

  // Location Handlers
  onCountryChange(event: MatSelectChange): void {
    this.updateStates(event.value);
    this.profileForm.patchValue({ state: '', city: '', postalCode: '' });
    this.cities = [];
  }

  onStateChange(event: MatSelectChange): void {
    const countryName = this.profileForm.get('country')?.value;
    this.updateCities(countryName, event.value);
    this.profileForm.patchValue({ city: '' });
  }

  private updateStates(countryName: string): void {
    const country = this.countries.find((c) => c.name === countryName);
    this.states = country ? State.getStatesOfCountry(country.isoCode) : [];
  }

  private updateCities(countryName: string, stateName: string): void {
    const country = this.countries.find((c) => c.name === countryName);
    if (!country) {
      this.cities = [];
      return;
    }
    const state = State.getStatesOfCountry(country.isoCode).find((s) => s.name === stateName);
    this.cities = state ? City.getCitiesOfState(country.isoCode, state.isoCode) : [];
  }

  
  private patchFormWithUserProfile(profile: UserProfile): void {
    const address = profile.defaultAddress || profile.vendorDetails;
    const countryName = address?.country;
    const stateName = address?.state;

    if (countryName) {
      this.updateStates(countryName);
      if (stateName) {
        this.updateCities(countryName, stateName);
      }
    }

    const vDetails = profile.vendorDetails;
    this.profileForm.patchValue({
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      businessName: vDetails?.bussinessName,
      storeName: vDetails?.storeName,
      bussinessDescription: vDetails?.bussinessDescription,
      gstin: vDetails?.gstin,
      pan: vDetails?.pan,
      bankAccountNumber: vDetails?.bankAccountNumber,
      ifscCode: vDetails?.ifscCode,
      accountHolderName: vDetails?.accountHolderName,
      addressLine1: address?.addressLine1,
      addressLine2: address?.addressLine2,
      city: address?.city,
      state: stateName,
      country: countryName,
      postalCode: address?.postalCode,
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

    const addressPayload = {
      addressLine1: formValue.addressLine1,
      addressLine2: formValue.addressLine2,
      city: formValue.city,
      state: formValue.state,
      country: formValue.country,
      postalCode: formValue.postalCode,
    };

    if (this.userRole === Role.Vendor && this.userProfile?.vendorDetails) {
      payload.bussinessDetails = {
        ...addressPayload,
        bussinessName: formValue.bussinessName,
        storeName: formValue.storeName,
        bussinessDescription: formValue.bussinessDescription,
        gstin: formValue.gstin,
        pan: formValue.pan,
        bankAccountNumber: formValue.bankAccountNumber,
        ifscCode: formValue.ifscCode,
        accountHolderName: formValue.accountHolderName,
        documentUrls: this.userProfile.vendorDetails.documentUrls,
        categories: this.userProfile.vendorDetails.categories,
      };
    }// Condition ko flexible banayein taaki vendorDetails hamesha attach ho
    if (this.userRole === Role.Vendor || this.userProfile?.vendorDetails || formValue.storeName) {
      payload.bussinessDetails = {
        ...addressPayload,
        bussinessName: formValue.businessName || this.userProfile?.vendorDetails?.bussinessName || null,
        storeName: formValue.storeName,
        bussinessDescription: formValue.bussinessDescription,
        gstin: formValue.gstin || this.userProfile?.vendorDetails?.gstin || null,
        pan: formValue.pan || this.userProfile?.vendorDetails?.pan || null,
        bankAccountNumber: formValue.bankAccountNumber,
        ifscCode: formValue.ifscCode,
        accountHolderName: formValue.accountHolderName,
        documentUrls: this.userProfile?.vendorDetails?.documentUrls || [],
        categories: this.userProfile?.vendorDetails?.categories || [],
      };
    } else if (this.userRole === Role.Customer) {
      payload.defaultAddress = addressPayload;
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
}