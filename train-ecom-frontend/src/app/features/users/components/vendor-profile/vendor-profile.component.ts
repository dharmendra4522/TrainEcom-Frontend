import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '../../../../core/store/user/user.selectors';
import { ProfileVendorDetails, UserProfile, ApprovalStatus, UpdateProfilePayload } from '../../../../core/models/user.model';
import { Category } from '../../../../core/models/category.model';
import { Country, ICountry, IState, ICity, State, City } from 'country-state-city';
import { Observable } from 'rxjs';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import * as CategoryActions from '../../../../core/store/category/category.action';
import * as UserActions from '../../../../core/store/user/user.actions';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { normalizeApprovalStatus } from '../../../../core/utils/role.utils';
import { selectAuthStatus } from '../../../../core/store/auth/auth.selectors';

interface ProfileField {
  label: string;
  value: string | number | null | undefined;
  isList?: boolean;
  isLink?: boolean;
  listItems?: string[] | null;
  isFullWidth?: boolean;
}

interface TabConfig {
  label: string;
  fields: ProfileField[];
}

interface VendorProfileEditValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  businessName: string;
  displayName: string;
  bussinessDescription: string;
  gstin: string;
  panNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  state: string;
  postalCode: string | number;
  bankAccountNumber: string | number;
  acountHolderName: string;
  ifscCode: string;
}

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styleUrl: './vendor-profile.component.css'
})
export class VendorProfileComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  isEditMode: boolean = false;
  userProfile$ = this.store.select(selectUserProfile);

  vendorData: ProfileVendorDetails | null = null;
  userProfileData: UserProfile | null = null;

  vendorsTabs: TabConfig[] = [];
  editForm!: FormGroup;
  currentStep: number = 1;
  isPasswordChangeMode: boolean = false;
  isSaving: boolean = false;
  authStatus: string | null = null;
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);
  countries: ICountry[] = Country.getAllCountries();
  states: IState[] = [];
  cities: ICity[] = [];

  ngOnInit(): void {
    this.initializeEditForm();
    this.store.dispatch(CategoryActions.loadCategories());
    this.store.select(selectAuthStatus).subscribe((status) => {
      this.authStatus = status;
    });
    this.fetchVendorDetails();
  }

  private fetchVendorDetails(): void {
    this.userProfile$.subscribe((profile) => {
      if (profile) {
        this.userProfileData = profile;
        this.vendorData = profile.vendorDetails || null;
        this.patchEditForm(profile);
        this.buildTabConfigurations();
      }
    });
  }

  toggleEditMode(): void {
    if (!this.isApprovedVendor) {
      return;
    }
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.userProfileData) {
      this.currentStep = 1;
      this.patchEditForm(this.userProfileData);
    }
  }

  get isApprovedVendor(): boolean {
    const approvalValue =
      this.userProfileData?.isApproved ??
      this.userProfileData?.approvalStatus ??
      this.userProfileData?.status ??
      this.userProfileData?.vendorDetails?.approvalStatus ??
      this.userProfileData?.vendorDetails?.status ??
      this.authStatus ??
      localStorage.getItem('vendorStatus');
    return normalizeApprovalStatus(approvalValue) === ApprovalStatus.Approved;
  }

  private initializeEditForm(): void {
    this.editForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
        lastName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        oldPassword: [''],
        newPassword: [''],
        confirmPassword: [''],
        businessName: [{ value: '', disabled: true }],
        displayName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/.*\S.*/)]],
        businessCategory: [{ value: [], disabled: true }],
        bussinessDescription: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/.*\S.*/)]],
        gstin: [{ value: '', disabled: true }],
        panNumber: [{ value: '', disabled: true }],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^(?!0{6})\d{6}$/)]],
        bankAccountNumber: [{ value: '', disabled: true }],
        acountHolderName: [{ value: '', disabled: true }],
        ifscCode: [{ value: '', disabled: true }],
        gstDocument: [''],
        businessDocument: [''],
        businessLogo: [''],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private patchEditForm(profile: UserProfile): void {
    const vendor = profile.vendorDetails;
    const nameParts = profile.name.trim().split(/\s+/);
    const address = vendor || profile.defaultAddress;
    this.editForm.patchValue({
      firstName: nameParts.shift() || '',
      lastName: nameParts.join(' '),
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      businessName: vendor?.bussinessName || '',
      displayName: vendor?.storeName || '',
      businessCategory: vendor?.categories || [],
      bussinessDescription: vendor?.bussinessDescription || '',
      gstin: vendor?.gstin || '',
      panNumber: vendor?.pan || '',
      addressLine1: address?.addressLine1 || '',
      addressLine2: address?.addressLine2 || '',
      city: address?.city || '',
      state: address?.state || '',
      country: address?.country || '',
      postalCode: address?.postalCode || '',
      bankAccountNumber: vendor?.bankAccountNumber || '',
      acountHolderName: vendor?.accountHolderName || '',
      ifscCode: vendor?.ifscCode || '',
    });
    this.updateLocationLists(address?.country, address?.state);
  }

  private updateLocationLists(countryName?: string | null, stateName?: string | null): void {
    const country = this.countries.find((item) => item.name === countryName);
    this.states = country ? State.getStatesOfCountry(country.isoCode) : [];
    const state = this.states.find((item) => item.name === stateName);
    this.cities = country && state ? City.getCitiesOfState(country.isoCode, state.isoCode) : [];
  }

  onCountryChange(countryName: string): void {
    this.editForm.patchValue({ state: '', city: '' });
    this.updateLocationLists(countryName, null);
  }

  onStateChange(stateName: string): void {
    this.editForm.patchValue({ city: '' });
    this.updateLocationLists(this.editForm.get('country')?.value as string, stateName);
  }

  onFileSelect(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.editForm.get(controlName)?.setValue(file);
    }
  }

  togglePasswordChange(): void {
    this.isPasswordChangeMode = !this.isPasswordChangeMode;
    const controls = ['oldPassword', 'newPassword', 'confirmPassword'];
    controls.forEach((name) => {
      const control = this.editForm.get(name);
      if (this.isPasswordChangeMode) {
        control?.setValidators([Validators.required]);
        if (name === 'newPassword') {
          control?.addValidators([Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]);
        }
      } else {
        control?.clearValidators();
        control?.reset('');
      }
      control?.updateValueAndValidity();
    });
    this.editForm.updateValueAndValidity();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value as string;
    const confirmControl = control.get('confirmPassword');
    if (newPassword && confirmControl?.value && newPassword !== confirmControl.value) {
      confirmControl.setErrors({ ...confirmControl.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }
    if (confirmControl?.hasError('passwordMismatch')) {
      const errors = { ...confirmControl.errors };
      delete errors['passwordMismatch'];
      confirmControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }

  get isStep1Valid(): boolean {
    return this.controlValid('firstName', 'lastName', 'phoneNumber') && (!this.isPasswordChangeMode || this.passwordControlsValid);
  }

  get isStep2Valid(): boolean { return this.controlValid('displayName', 'bussinessDescription'); }
  get isStep3Valid(): boolean { return this.controlValid('addressLine1', 'country', 'state', 'city', 'postalCode'); }
  get isStep4Valid(): boolean { return true; }
  get isStep5Valid(): boolean { return true; }

  private controlValid(...names: string[]): boolean {
    return names.every((name) => this.editForm.get(name)?.valid === true);
  }

  private get passwordControlsValid(): boolean {
    return this.controlValid('oldPassword', 'newPassword', 'confirmPassword') && !this.editForm.hasError('passwordMismatch');
  }

  goToStep(step: number): void { this.currentStep = step; }
  nextStep(): void { if (this.currentStep < 5) this.currentStep++; }
  prevStep(): void { if (this.currentStep > 1) this.currentStep--; }

  saveProfile(): void {
    if (!this.isStep1Valid || !this.isStep2Valid || !this.isStep3Valid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const value = this.editForm.getRawValue() as VendorProfileEditValues;
    const payload: UpdateProfilePayload = {
      name: `${value.firstName.trim()} ${value.lastName.trim()}`.trim(),
      phoneNumber: value.phoneNumber,
      bussinessDetails: {
        bussinessName: value.businessName,
        storeName: value.displayName,
        bussinessDescription: value.bussinessDescription,
        addressLine1: value.addressLine1,
        addressLine2: value.addressLine2,
        city: value.city,
        state: value.state,
        country: value.country,
        postalCode: String(value.postalCode),
        gstin: value.gstin,
        pan: value.panNumber,
        accountHolderName: value.acountHolderName,
        bankAccountNumber: String(value.bankAccountNumber),
        ifscCode: value.ifscCode,
        categories: this.vendorData?.categories || [],
        documentUrls: this.vendorData?.documentUrls || [],
      },
    };
    if (this.isPasswordChangeMode) {
      payload.oldPassword = value.oldPassword;
      payload.newPassword = value.newPassword;
      payload.confirmPassword = value.confirmPassword;
    }
    this.isSaving = true;
    this.userService.updateUserProfile(payload).subscribe({
      next: (profile) => {
        this.isSaving = false;
        this.isEditMode = false;
        this.isPasswordChangeMode = false;
        this.userProfileData = profile;
        this.vendorData = profile.vendorDetails || null;
        this.buildTabConfigurations();
        this.store.dispatch(UserActions.loadProfileSuccess({ profile }));
        this.notificationService.showSuccess('Profile updated successfully');
      },
      error: (error: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.notificationService.showError(error.error?.message || 'Profile update failed');
      },
    });
  }

  // Map data in label-value format for display in UI
  private buildTabConfigurations(): void {
    if (!this.vendorData || !this.userProfileData) {
      return;
    }
    const v = this.vendorData;
    const u = this.userProfileData;

    this.vendorsTabs = [
      {
        label: 'General Information',
        fields: [
          { label: 'Full Name', value: u?.name },
          { label: 'Email Address', value: u?.email },
          { label: 'Phone Number', value: u?.phoneNumber }
        ]
      },
      {
        label: 'Business',
        fields: [
          { label: 'Business Name', value: v?.bussinessName },
          { label: 'Display Name', value: v?.storeName },
          { label: 'Business Description', value: v?.bussinessDescription },
          { label: 'Categories', value: null, isList: true, listItems: v?.categories }
        ]
      },
      {
        label: 'Address',
        fields: [
          { label: 'Address Line 1', value: v?.addressLine1 },
          { label: 'Address Line 2', value: v?.addressLine2 },
          { label: 'City', value: v?.city },
          { label: 'State', value: v?.state },
          { label: 'Country', value: v?.country },
          { label: 'Postal Code', value: v?.postalCode }
        ]
      },
      {
        label: 'Account & Tax',
        fields: [
          { label: 'GSTIN', value: v?.gstin },
          { label: 'PAN Number', value: v?.pan },
          { label: 'Account Holder Name', value: v?.accountHolderName },
          { label: 'Bank Account Number', value: v?.bankAccountNumber },
          { label: 'IFSC Code', value: v?.ifscCode },
        ]
      },
      {
        label: 'Documents',
        fields: [
          { label: 'Business Registration Document', value: v?.documentUrls?.[0] || 'Not provided', isLink: true },
          { label: 'GST Document', value: v?.documentUrls?.[1] || 'Not provided', isLink: true },
          { label: 'Business Logo / Other Document', value: v?.documentUrls?.[2] || 'Not provided', isLink: true }
        ]
      }
    ];
  }
}