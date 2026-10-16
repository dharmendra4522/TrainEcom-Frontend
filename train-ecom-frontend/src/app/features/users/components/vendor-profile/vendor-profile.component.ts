import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '../../../../core/store/user/user.selectors';
import {
  ProfileVendorDetails,
  UserProfile,
  ApprovalStatus,
  UpdateProfilePayload
} from '../../../../core/models/user.model';
import { Category } from '../../../../core/models/category.model';
import {
  Country,
  ICountry,
  IState,
  ICity,
  State,
  City
} from 'country-state-city';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import * as CategoryActions from '../../../../core/store/category/category.action';
import * as UserActions from '../../../../core/store/user/user.actions';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { normalizeApprovalStatus } from '../../../../core/utils/role.utils';
import { selectAuthStatus } from '../../../../core/store/auth/auth.selectors';
import { VendorProfileEditValues } from '../../../../core/models/vendor.model';
import { fileValidator } from '../../../auth/register.utils';
import {
  ProfileFieldConfig,
  VENDOR_PROFILE_TABS,
  VendorTabConfig
} from './vendor-profile.constants';

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
  // password visibility toggles
  vendorData: ProfileVendorDetails | null = null;
  userProfileData: UserProfile | null = null;

  tabConfig: VendorTabConfig[] = VENDOR_PROFILE_TABS;
  editForm!: FormGroup;
  currentStep: number = 1;
  isPasswordChangeMode: boolean = false;
  isSaving: boolean = false;
  authStatus: string | null = null;
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);
  private categoryOptions: Category[] = [];
  countries: ICountry[] = Country.getAllCountries();
  states: IState[] = [];
  cities: ICity[] = [];

  ngOnInit(): void {
    this.initializeEditForm();
    this.loadCategories();
    this.subscribeAuthStatus();
    this.fetchVendorDetails();
  }

  // form initialization and patching methods
  private initializeEditForm(): void {
    this.editForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[a-zA-Z\s]+$/)
          ]
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[a-zA-Z\s]+$/)
          ]
        ],
        email: [
          { value: '', disabled: true },
          [Validators.required, Validators.email]
        ],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]
        ],
        oldPassword: [''],
        newPassword: [''],
        confirmPassword: [''],
        businessName: [{ value: '', disabled: true }],
        displayName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/.*\S.*/)
          ]
        ],
        businessCategory: [[], Validators.required],
        bussinessDescription: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.pattern(/.*\S.*/)
          ]
        ],
        gstin: [{ value: '', disabled: true }],
        panNumber: [{ value: '', disabled: true }],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: [
          '',
          [Validators.required, Validators.pattern(/^(?!0{6})\d{6}$/)]
        ],
        bankAccountNumber: [{ value: '', disabled: true }],
        acountHolderName: [{ value: '', disabled: true }],
        ifscCode: [{ value: '', disabled: true }],
        gstDocument: ['', [fileValidator(['application/pdf'], 5)]],
        businessDocument: ['', [fileValidator(['application/pdf'], 5)]],
        businessLogo: [
          '',
          [
            fileValidator(
              ['image/jpeg', 'image/png', 'image/jpeg', 'image/webp'],
              5
            )
          ]
        ]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // handle category load fron store and set to form
  private loadCategories(): void {
    this.store.dispatch(CategoryActions.loadCategories());
    this.categories$
      .pipe(
        filter((categories) => categories.length > 0),
        take(1)
      )
      .subscribe((categories) => {
        this.categoryOptions = categories;
        if (this.userProfileData) {
          this.patchEditForm(this.userProfileData);
        }
      });
  }

  // subscribe Auth status from store
  private subscribeAuthStatus(): void {
    this.store.select(selectAuthStatus).subscribe((status) => {
      this.authStatus = status;
    });
  }

  // fetch vendor details from user profile and patch the form
  private fetchVendorDetails(): void {
    this.userProfile$.subscribe((profile) => {
      if (profile) {
        this.userProfileData = profile;
        this.vendorData = profile.vendorDetails || null;
        if (this.vendorData && this.vendorData.documents) {
          const urls: string[] = [];
          this.vendorData.documents.forEach((doc) => {
            if (Number(doc.documentType) === 1) urls[0] = doc.documentUrl;
            if (Number(doc.documentType) === 2) urls[1] = doc.documentUrl;
            if (Number(doc.documentType) === 3) urls[2] = doc.documentUrl;
          });
          this.vendorData.documentUrls = urls;
        }
        this.patchEditForm(profile);
      }
    });
  }

  getDocumentUrl(documentType: number): string | null {
    const document = this.vendorData?.documents?.find(
      (item) =>
        Number(item.documentType) === documentType && !!item.documentUrl,
    );
    return (
      document?.documentUrl ||
      this.vendorData?.documentUrls?.[documentType - 1] ||
      null
    );
  }

  get vendorCategories(): string[] {
    return this.vendorData?.categories ?? [];
  }

  // toggle edit mode only if vendor is approved
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

  // Patch the form with user profile data
  private patchEditForm(profile: UserProfile): void {
    const vendor = profile.vendorDetails;
    const nameParts = profile.name.trim().split(/\s+/);
    const vendorRecord = (vendor || {}) as ProfileVendorDetails & {
      address?: ProfileVendorDetails['defaultAddress'];
      businessAddress?: ProfileVendorDetails['defaultAddress'];
    };
    const profileRecord = profile as UserProfile & {
      address?: ProfileVendorDetails['defaultAddress'];
    };
    const address =
      vendorRecord.defaultAddress ||
      vendorRecord.address ||
      vendorRecord.businessAddress ||
      profile.defaultAddress ||
      profileRecord.address ||
      vendor;
    const location = this.resolveLocation(
      address?.country,
      address?.state,
      address?.city
    );
    this.editForm.patchValue({
      firstName: nameParts.shift() || '',
      lastName: nameParts.join(' '),
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      businessName: vendor?.bussinessName || '',
      displayName: vendor?.storeName || '',
      businessCategory: this.normalizeCategoryIds(vendor?.categories),
      bussinessDescription: vendor?.bussinessDescription || '',
      gstin: vendor?.gstin || '',
      panNumber: vendor?.pan || '',
      addressLine1: address?.addressLine1 || '',
      addressLine2: address?.addressLine2 || '',
      city: location.city,
      state: location.state,
      country: location.country,
      postalCode: address?.postalCode || '',
      bankAccountNumber: vendor?.bankAccountNumber || '',
      acountHolderName: vendor?.accountHolderName || '',
      ifscCode: vendor?.ifscCode || ''
    });
    this.updateLocationLists(location.country, location.state);
  }

  // resolve location names from country, state, and city codes or names
  private resolveLocation(
    countryName?: string | number | null,
    stateName?: string | number | null,
    cityName?: string | number | null,
  ): { country: string; state: string; city: string } {
    const country = this.countries.find(
      (item) =>
        this.matchesLocation(item.name, countryName) ||
        this.matchesLocation(item.isoCode, countryName),
    );
    const states = country ? State.getStatesOfCountry(country.isoCode) : [];
    const state = states.find(
      (item) =>
        this.matchesLocation(item.name, stateName) ||
        this.matchesLocation(item.isoCode, stateName),
    );
    const cities =
      country && state
        ? City.getCitiesOfState(country.isoCode, state.isoCode)
        : [];
    const city = cities.find((item) =>
      this.matchesLocation(item.name, cityName),
    );

    return {
      country: country?.name || String(countryName || ''),
      state: state?.name || String(stateName || ''),
      city: city?.name || String(cityName || ''),
    };
  }

  // Utility methods for form validation and location matching
  private matchesLocation(
    option: string | undefined,
    value?: string | number | null,
  ): boolean {
    return (
      option?.trim().toLowerCase() ===
      String(value || '')
        .trim()
        .toLowerCase()
    );
  }

  // Utility method to normalize category IDs from names or numbers
  private normalizeCategoryIds(
    categories?: Array<string | number> | null,
  ): number[] {
    if (!categories?.length) {
      return [];
    }

    return categories.reduce<number[]>((categoryIds, category) => {
      const match = this.categoryOptions.find(
        (option) =>
          String(option.id) === String(category) || option.name === category,
      );
      const categoryId = Number(match?.id ?? category);
      if (Number.isInteger(categoryId) && categoryId > 0) {
        categoryIds.push(categoryId);
      }
      return categoryIds;
    }, []);
  }

  // utility methods for updating location lists based on selected country and state
  private updateLocationLists(
    countryName?: string | null,
    stateName?: string | null,
  ): void {
    const country = this.countries.find((item) =>
      this.matchesLocation(item.name, countryName)
    );
    this.states = country ? State.getStatesOfCountry(country.isoCode) : [];
    const state = this.states.find((item) =>
      this.matchesLocation(item.name, stateName)
    );
    this.cities =
      country && state
        ? City.getCitiesOfState(country.isoCode, state.isoCode)
        : [];
  }

  // Event handlers for country and state selection changes
  onCountryChange(countryName: string): void {
    this.editForm.patchValue({ state: '', city: '', postalCode: '' });
    this.updateLocationLists(countryName, null);
  }

  // Event handler for state selection change
  onStateChange(stateName: string): void {
    this.editForm.patchValue({ city: '' });
    this.updateLocationLists(
      this.editForm.get('country')?.value as string,
      stateName
    );
  }

  // Event handler for file selection for document uploads
  onFileSelect(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const control = this.editForm.get(controlName);
    const file = input.files?.[0];
    if (file) {
      control?.setValue(file);
      control?.markAsTouched();
      control?.updateValueAndValidity();
      if (control?.invalid) {
        input.value = '';
      }
    }
  }

  // Toggle password change mode and update validators accordingly
  togglePasswordChange(): void {
    this.isPasswordChangeMode = !this.isPasswordChangeMode;
    const controls = ['oldPassword', 'newPassword', 'confirmPassword'];
    controls.forEach((name) => {
      const control = this.editForm.get(name);
      if (this.isPasswordChangeMode) {
        control?.setValidators([Validators.required]);
        if (name === 'newPassword') {
          control?.addValidators([
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            )
          ]);
        }
      } else {
        control?.clearValidators();
        control?.reset('');
      }
      control?.updateValueAndValidity();
    });
    this.editForm.updateValueAndValidity();
  }

  // Custom validator to ensure new password and confirm password match
  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value as string;
    const confirmControl = control.get('confirmPassword');
    if (
      newPassword &&
      confirmControl?.value &&
      newPassword !== confirmControl.value
    ) {
      confirmControl.setErrors({
        ...confirmControl.errors,
        passwordMismatch: true,
      });
      return { passwordMismatch: true };
    }
    if (confirmControl?.hasError('passwordMismatch')) {
      const errors = { ...confirmControl.errors };
      delete errors['passwordMismatch'];
      confirmControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }

  // Getter methods to check the validity of each step in the multi-step form
  get isStep1Valid(): boolean {
    return (
      this.controlValid('firstName', 'lastName', 'phoneNumber') &&
      (!this.isPasswordChangeMode || this.passwordControlsValid)
    );
  }

  // Getter methods to check the validity of each step in the multi-step form
  get isStep2Valid(): boolean {
    return this.controlValid(
      'displayName',
      'businessCategory',
      'bussinessDescription'
    );
  }
  get isStep3Valid(): boolean {
    return this.controlValid(
      'addressLine1',
      'country',
      'state',
      'city',
      'postalCode'
    );
  }
  get isStep4Valid(): boolean {
    return true;
  }
  get isStep5Valid(): boolean {
    return true;
  }

  private controlValid(...names: string[]): boolean {
    return names.every((name) => this.editForm.get(name)?.valid === true);
  }

  get invalidFieldLabels(): string[] {
    const labels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      phoneNumber: 'Phone Number',
      displayName: 'Display Name',
      businessCategory: 'Business Category',
      bussinessDescription: 'Business Description',
      addressLine1: 'Address Line 1',
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Postal Code',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      gstDocument: 'GST Document',
      businessDocument: 'Registration Document',
      businessLogo: 'Business Logo'
    };

    return Object.keys(this.editForm.controls)
      .filter((name) => this.editForm.get(name)?.invalid)
      .map((name) => labels[name] || name);
  }

  private get passwordControlsValid(): boolean {
    return (
      this.controlValid('oldPassword', 'newPassword', 'confirmPassword') &&
      !this.editForm.hasError('passwordMismatch')
    );
  }

  // steps navigation methods
  goToStep(step: number): void {
    this.currentStep = step;
  }
  nextStep(): void {
    if (this.currentStep < 5) this.currentStep++;
  }
  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // Save the profile data by sending an update request to the server
  saveProfile(): void {
    if (this.isSaving) {
      return;
    }
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.notificationService.showError(
        `Please fix: ${this.invalidFieldLabels.join(', ')}.`
      );
      return;
    }
    const value = this.editForm.value as VendorProfileEditValues;
    const payload: UpdateProfilePayload = {
      name: `${value.firstName?.trim() || ''} ${value.lastName?.trim() || ''}`.trim(),
      phoneNumber: value.phoneNumber,
      bussinessDetails: {
        bussinessName: value.businessName ?? null,
        storeName: value.displayName ?? null,
        bussinessDescription: value.bussinessDescription ?? null,
        addressLine1: value.addressLine1 ?? null,
        addressLine2: value.addressLine2 ?? null,
        city: value.city ?? null,
        state: value.state ?? null,
        country: value.country ?? null,
        postalCode: value.postalCode ? String(value.postalCode) : null,
        gstin: value.gstin ?? null,
        pan: value.panNumber ?? null,
        accountHolderName: value.acountHolderName ?? null,
        bankAccountNumber: value.bankAccountNumber
          ? String(value.bankAccountNumber)
          : null,
        ifscCode: value.ifscCode ?? null,
        newCategoryIds: this.getSelectedCategoryIds(),
        documentUrls: this.vendorData?.documentUrls || []
      }
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
        this.store.dispatch(UserActions.loadProfileSuccess({ profile }));
        this.notificationService.showSuccess('Profile updated successfully');
      },
      error: (error: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.notificationService.showError(
          error.error?.message || 'Profile update failed'
        );
      }
    });
  }

  // Get selected category IDs from the form for submission
  private getSelectedCategoryIds(): number[] {
    const selectedCategories = this.editForm.get('businessCategory')?.value;
    if (!Array.isArray(selectedCategories)) {
      return [];
    }

    return selectedCategories.reduce<number[]>((categoryIds, cat: unknown) => {
      const matched = this.categoryOptions.find(
        (option) => String(option.id) === String(cat) || option.name === cat,
      );
      const categoryId = Number(matched?.id ?? cat);
      if (Number.isInteger(categoryId) && categoryId > 0) {
        categoryIds.push(categoryId);
      }
      return categoryIds;
    }, []);
  }

  getTabFields(tabLabel: string): ProfileFieldConfig[] {
    const matchedTab = this.tabConfig.find((t) => t.label === tabLabel);
    return matchedTab ? matchedTab.fields : [];
  }

  getFieldValue(key: string): string | number | null | undefined {
    if (key === 'name') {
      return this.userProfileData?.name;
    }
    if (key === 'email') {
      return this.userProfileData?.email;
    }
    if (key === 'phoneNumber') {
      return this.userProfileData?.phoneNumber;
    }

    if (this.vendorData) {
      const vendorKey = key as keyof ProfileVendorDetails;
      const value = this.vendorData[vendorKey];

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        value === null ||
        value === undefined
      ) {
        return value;
      }
    }

    return null;
  }
}
