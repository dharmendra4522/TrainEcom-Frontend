import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { fileValidator } from '../../../auth/register.utils';
import { Category } from '../../../../core/models/category.model';
import { Store } from '@ngrx/store';
import * as CategoryActions from '../../../../core/store/category/category.action';
import * as UserActions from '../../../../core/store/user/user.actions';
import { filter, Observable, take } from 'rxjs';
import { selectAllCategories } from '../../../../core/store/category/category.selectors';
import {
  ProfileVendorDetails,
  UpdateProfilePayload,
  UserProfile
} from '../../../../core/models/user.model';
import {
  City,
  Country,
  ICity,
  ICountry,
  IState,
  State
} from 'country-state-city';
import { PendingFieldChanges } from '../../../../core/models/request-approve.model';
import {
  DocumentType,
  VendorProfileEditValues
} from '../../../../core/models/vendor.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../core/services/user.service';
import { normalizeCategoryIds, passwordMatchValidator } from '../../users.utils';

@Component({
  selector: 'app-vendor-profile-edit',
  templateUrl: './vendor-profile-edit.component.html',
  styleUrl: './vendor-profile-edit.component.css'
})
export class VendorProfileEditComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  @Input() userProfileData: UserProfile | null = null;
  @Input() vendorData: ProfileVendorDetails | null = null;

  @Output() onEditModeToggle = new EventEmitter<boolean>();
  @Output() onProfileUpdate = new EventEmitter<void>();

  editForm!: FormGroup;
  isPasswordChangeMode: boolean = false;
  private categoryOptions: Category[] = [];
  isSaving: boolean = false;
  categories$: Observable<Category[]> = this.store.select(selectAllCategories);
  countries: ICountry[] = Country.getAllCountries();
  states: IState[] = [];
  cities: ICity[] = [];
  pendingChangesMap: Record<string, PendingFieldChanges> = {};
  readonly isStep4Valid: boolean = true;
  readonly isStep5Valid: boolean = true;

  // handle changes in inputs property and patch form values
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userProfileData'] && this.userProfileData && this.editForm) {
      this.patchEditForm(this.userProfileData);
    }
  }

  ngOnInit(): void {
    this.initializeEditForm();
    this.loadCategories();
  }

  // Initialize the edit form with validation rules
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
        bankAccountNumber: [{ value: '' }],
        acountHolderName: [{ value: '' }],
        ifscCode: [{ value: '' }],
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
      { validators: passwordMatchValidator }
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

  // Patch the edit form with user profile data
  private patchEditForm(profile: UserProfile): void {
    const vendor = profile.vendorDetails;
    const [firstName, ...lastNameParts] = profile.name.trim().split(/\s+/);
    const location = this.resolveLocation(
      vendor?.country,
      vendor?.state,
      vendor?.city
    );
    this.editForm.patchValue({
      firstName: firstName,
      lastName: lastNameParts.join(' '),
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      businessName: vendor?.bussinessName ?? '',
      displayName: vendor?.storeName ?? '',
      businessCategory: normalizeCategoryIds(
        vendor?.categories,
        this.categoryOptions
      ),
      bussinessDescription: vendor?.bussinessDescription ?? '',
      gstin: vendor?.gstin ?? '',
      panNumber: vendor?.pan ?? '',
      addressLine1: vendor?.addressLine1 ?? '',
      addressLine2: vendor?.addressLine2 ?? '',
      city: location.city,
      state: location.state,
      country: location.country,
      postalCode: vendor?.postalCode ?? '',
      bankAccountNumber: vendor?.bankAccountNumber ?? '',
      acountHolderName: vendor?.accountHolderName ?? '',
      ifscCode: vendor?.ifscCode ?? ''
    });

    this.updateLocationLists(location.country, location.state);
  }

  // resolve location names from country, state, and city codes or names
  private resolveLocation(
    country?: string | null,
    state?: string | null,
    city?: string | null
  ): { country: string; state: string; city: string } {
    return {
      country: country ?? '',
      state: state ?? '',
      city: city ?? ''
    };
  }

  // Utility methods for form validation and location matching
  private matchesLocation(
    option: string | undefined,
    value?: string | null
  ): boolean {
    return option?.trim().toLowerCase() === value?.trim().toLowerCase();
  }

  // utility methods for updating location lists based on selected country and state
  private updateLocationLists(
    countryName?: string | null,
    stateName?: string | null
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
    const country = this.editForm.get('country')?.value;
    if (typeof country === 'string') {
      this.updateLocationLists(country, stateName);
    }
  }


  // Helper method to check the validity of multiple form controls
  private controlValid(...names: string[]): boolean {
    return names.every((name) => this.editForm.get(name)?.valid === true);
  }

  private get passwordControlsValid(): boolean {
    return (
      this.controlValid('oldPassword', 'newPassword', 'confirmPassword') &&
      !this.editForm.hasError('passwordMismatch')
    );
  }

  // Getter methods to check the validity of each step in the multi-step form
  get isStep1Valid(): boolean {
    return (
      this.controlValid('firstName', 'lastName', 'phoneNumber') &&
      (!this.isPasswordChangeMode || this.passwordControlsValid)
    );
  }

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

  // Get selected category IDs from the form for submission
  private getSelectedCategoryIds(): number[] {
    return this.editForm.get('businessCategory')?.value ?? [];
  }

  // Get selected category names from the form
  private getSelectedCategoryNames(): string[] {
    const selectedCategories = this.editForm.get('businessCategory')?.value;
    if (!Array.isArray(selectedCategories)) {
      return [];
    }
    const categoryNames: string[] = [];
    for (const cat of selectedCategories) {
      const matched = this.categoryOptions.find((option) => option.id === cat);
      if (matched) {
        categoryNames.push(matched.name);
      }
    }
    return categoryNames;
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

  // Save the profile data by sending an update request to the server
  saveProfile(): void {
    if (!this.validateForm()) {
      return;
    }
    const value = this.editForm.value as VendorProfileEditValues;
    this.collectPendingChanges(value);
    const payload = this.buildPayload(value);
    this.updateProfile(payload);
  }

  // Validate the form
  private validateForm(): boolean {
    if (this.isSaving) {
      return false;
    }
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.notificationService.showError(
        `Please fix: ${this.invalidFieldLabels.join(', ')}.`
      );
      return false;
    }
    return true;
  }

  // Collect pending changes
  private collectPendingChanges(value: VendorProfileEditValues): void {
    this.trackBasicChanges(value);
    this.trackDocumentChanges(value);
  }

  // track basic changes and add them to pending changes
  private trackBasicChanges(value: VendorProfileEditValues): void {
    if (
      value.phoneNumber &&
      value.phoneNumber !== this.userProfileData?.phoneNumber
    ) {
      this.addPendingChange(
        'phoneNumber',
        'Phone Number',
        this.userProfileData?.phoneNumber,
        value.phoneNumber
      );
    }
    if (value.displayName && value.displayName !== this.vendorData?.storeName) {
      this.addPendingChange(
        'storeName',
        'Display Name',
        this.vendorData?.storeName,
        value.displayName
      );
    }
    const selectedCategoryNames = this.getSelectedCategoryNames();
    if (
      JSON.stringify(selectedCategoryNames) !==
      JSON.stringify(this.vendorData?.categories ?? [])
    ) {
      this.addPendingChange(
        'categories',
        'Categories',
        this.vendorData?.categories ?? [],
        selectedCategoryNames
      );
    }
    if (
      value.acountHolderName &&
      value.acountHolderName !== this.vendorData?.accountHolderName
    ) {
      this.addPendingChange(
        'accountHolderName',
        'Account Holder Name',
        this.vendorData?.accountHolderName,
        value.acountHolderName
      );
    }
    if (
      value.bankAccountNumber &&
      value.bankAccountNumber !== this.vendorData?.bankAccountNumber
    ) {
      this.addPendingChange(
        'bankAccountNumber',
        'Bank Account Number',
        this.vendorData?.bankAccountNumber,
        value.bankAccountNumber
      );
    }
    if (value.ifscCode && value.ifscCode !== this.vendorData?.ifscCode) {
      this.addPendingChange(
        'ifscCode',
        'IFSC Code',
        this.vendorData?.ifscCode,
        value.ifscCode
      );
    }
  }

  // Track document changes and add them to pending changes
  private trackDocumentChanges(value: VendorProfileEditValues): void {
    if (value.businessDocument instanceof File) {
      this.addPendingChange(
        'businessDocument',
        'Business Registration Document',
        this.getDocumentUrl(DocumentType.BussinessDocument),
        value.businessDocument.name
      );
    }
    if (value.gstDocument instanceof File) {
      this.addPendingChange(
        'gstDocument',
        'GST Document',
        this.getDocumentUrl(DocumentType.GSTDocument),
        value.gstDocument.name
      );
    }
    if (value.businessLogo instanceof File) {
      this.addPendingChange(
        'businessLogo',
        'Business Logo',
        this.getDocumentUrl(DocumentType.Logo),
        value.businessLogo.name
      );
    }
  }

  // Build the payload for updating the user profile
  private buildPayload(value: VendorProfileEditValues): UpdateProfilePayload {
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
    return payload;
  }

  // Update the user profile by sending the payload to the UserService
  private updateProfile(payload: UpdateProfilePayload): void {
    this.isSaving = true;
    this.userService.updateUserProfile(payload).subscribe({
      next: (profile) => {
        this.isSaving = false;
        this.isPasswordChangeMode = false;
        this.userProfileData = profile;
        this.vendorData = profile.vendorDetails || null;
        this.store.dispatch(UserActions.loadProfileSuccess({ profile }));
        this.notificationService.showSuccess('Profile updated successfully');
        this.onProfileUpdate.emit();
        this.onEditModeToggle.emit(false);
      },
      error: (error: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.notificationService.showError(
          error.error?.message || 'Profile update failed'
        )
      }
    });
  }

  // helper method to add a pending change to the pendingChangesMap
  private addPendingChange(
    fieldKey: string,
    fieldName: string,
    oldValue: unknown,
    newValue: unknown
  ): void {
    this.pendingChangesMap[fieldKey] = {
      fieldKey,
      fieldName,
      oldValue,
      newValue,
      status: 'PENDING',
      requestAt: new Date().toISOString()
    }
  }

  // Get the document URL for a specific document type
  getDocumentUrl(documentType: number): string | null {
    const document = this.vendorData?.documents?.find(
      (item) => item.documentType === documentType
    );
    return (
      document?.documentUrl ||
      this.vendorData?.documentUrls?.[documentType - 1] ||
      null
    );
  }
}
