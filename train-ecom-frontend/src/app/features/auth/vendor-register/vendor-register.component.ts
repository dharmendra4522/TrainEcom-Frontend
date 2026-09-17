import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../../../core/models/category.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as CategoryActions from '../../../core/store/category/category.action';
import { selectAllCategories } from '../../../core/store/category/category.selectors';
import { NotificationService } from '../../../core/services/notification.service';
import { Country, State, City } from 'country-state-city';
import { ICountry, IState, ICity } from 'country-state-city';
import { MatSelectChange } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { VendorRegisterResponse } from '../../../core/models/auth.model';

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

@Component({
  selector: 'app-vendor-register',
  templateUrl: './vendor-register.component.html',
  styleUrl: './vendor-register.component.css',
})
export class VendorRegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private route = inject(Router);
  private authService = inject(AuthService);

  categories$!: Observable<Category[]>;
  registerForm!: FormGroup;

  isPasswordView: boolean = false;
  isConfirmPassView: boolean = false;

  countries: ICountry[] = [];
  states: IState[] = [];
  cities: ICity[] = [];

  // for tab navigation
  currentStep: number = 1;

  ngOnInit() {
    this.initializeForm();
    this.fetchAllCategory();
    this.countries = Country.getAllCountries();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[a-zA-Z\s]+$/),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[a-zA-Z\s]+$/),
          ],
        ],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^\d{10}$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],

        businessName: ['', [Validators.required, Validators.minLength(3)]],
        displayName: ['', [Validators.required, Validators.minLength(3)]],
        businessDescription: [
          '',
          [Validators.required, Validators.minLength(10)],
        ],
        businessCategory: [[], Validators.required],
        gstDocument: ['', [fileValidator(['application/pdf'], 5)]],
        businessDocument: ['', [fileValidator(['application/pdf'], 5)]],
        businessLogo: [
          '',
          [
            fileValidator(
              ['image/jpeg', 'image/png', 'image/jpeg', 'image/webp'],
              5,
            ),
          ],
        ],

        gstin: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            ),
          ],
        ],
        panNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^[A-Z]{3}[ABCFGHLJPT]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/,
            ),
          ],
        ],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],

        bankAccountNumber: ['', [Validators.pattern(/^\d{9,18}$/)]],
        acountHolderName: [''],
        ifscCode: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      },
      { validators: passwordMatchValidator },
    );
  }

  // method change state based on country
  onCountryChange(event: MatSelectChange): void {
    const countryName = event.value;
    if (countryName) {
      const selectedCounty = this.countries.find((c) => c.name === countryName);
      if (selectedCounty) {
        this.states = State.getStatesOfCountry(selectedCounty.isoCode);
      }
      this.cities = [];
      this.registerForm.get('state')?.reset();
      this.registerForm.get('city')?.reset();
    } else {
      this.states = [];
      this.cities = [];
    }
  }

  // method for change city based on state
  onStateChange(event: MatSelectChange): void {
    const stateName = event.value;
    const countryName = this.registerForm.get('country')?.value;
    if (stateName && countryName) {
      const selectedCountry = this.countries.find(
        (c) => c.name === countryName,
      );
      if (selectedCountry) {
        const stateList = State.getStatesOfCountry(selectedCountry.isoCode);
        const selectedState = stateList.find((s) => s.name === stateName);
        if (selectedState) {
          this.cities = City.getCitiesOfState(
            selectedCountry.isoCode,
            selectedState.isoCode,
          );
        }
      }
      this.registerForm.get('city')?.reset();
    } else {
      this.cities = [];
    }
  }

  // form Sumbit method
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.notificationService.showError('Form is invalid');
      return;
    }
    const formValue = this.registerForm.value;
    const fullName = `${formValue.firstName.trim()} ${formValue.lastName.trim()}`;
    const formData = new FormData();
    // basic details
    formData.append('BasicDetails.Name', fullName);
    formData.append('BasicDetails.Email', formValue.email);
    formData.append('BasicDetails.Password', formValue.password);
    formData.append('BasicDetails.ConfirmPassword', formValue.confirmPassword);
    formData.append('BasicDetails.PhoneNumber', formValue.phoneNumber);

    // Business & Address Info
    formData.append('BussinessName', formValue.businessName);
    formData.append('BussinessDescription', formValue.businessDescription);
    formData.append('StoreName', formValue.displayName);
    formData.append('GSTIN', formValue.gstin);
    formData.append('PAN', formValue.panNumber);
    formData.append('AddressLine1', formValue.addressLine1);
    if (formValue.addressLine2) {
      formData.append('AddressLine2', formValue.addressLine2);
    }
    formData.append('City', formValue.city);
    formData.append('State', formValue.state);
    formData.append('Country', formValue.country);
    formData.append('PostalCode', formValue.postalCode);
    if (formValue.bankAccountNumber)
      formData.append(
        'BankAccountNumber',
        formValue.bankAccountNumber.toString(),
      );
    if (formValue.ifscCode) formData.append('IFSCCode', formValue.ifscCode);
    if (formValue.acountHolderName)
      formData.append('AccountHolderName', formValue.acountHolderName);

    const categories: string[] = Array.isArray(formValue.businessCategory)
      ? formValue.businessCategory
      : [formValue.businessCategory];
    categories.forEach((catId: string) => {
      formData.append('CategoryIds', catId);
    });

    if (formValue.gstDocument instanceof File) {
      formData.append('DocumentTypes', 'GST');
      formData.append('Documents', formValue.gstDocument);
    }
    if (formValue.businessDocument instanceof File) {
      formData.append('DocumentTypes', 'BusinessRegistration');
      formData.append('Documents', formValue.businessDocument);
    }
    if (formValue.businessLogo instanceof File) {
      formData.append('BusinessLogo', formValue.businessLogo);
    }

    this.authService.vendorRegister(formData).subscribe({
      next: (res: VendorRegisterResponse) => {
        this.notificationService.showSuccess(res.message);
        this.registerForm.reset();
        this.route.navigate(['/login']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.notificationService.showError(
          err?.error?.message || 'Registration failed',
        );
      },
    });
  }

  viewPassord(): void {
    this.isPasswordView = !this.isPasswordView;
  }

  viewConfirmPassword(): void {
    this.isConfirmPassView = !this.isConfirmPassView;
  }

  fetchAllCategory(): void {
    this.store.dispatch(CategoryActions.loadCategories());

    this.categories$ = this.store.select(selectAllCategories);
  }

  onFileSelect(event: Event, controlName: string): void {
    const inputEvent = event.target as HTMLInputElement;
    if (inputEvent.files && inputEvent.files.length > 0) {
      const file = inputEvent.files[0];
      const control = this.registerForm.get(controlName);

      if (control) {
        control.setValue(file);
        control.markAsTouched();
        control.updateValueAndValidity();
        if (control.invalid) {
          inputEvent.value = '';
        }
      }
    }
  }

  // getter function for disable the next button
  get isStep1Valid(): boolean {
    const firstName = this.registerForm.get('firstName');
    const lastName = this.registerForm.get('lastName');
    const email = this.registerForm.get('email');
    const phoneNumber = this.registerForm.get('phoneNumber');
    const password = this.registerForm.get('password');
    const confirmPassword = this.registerForm.get('confirmPassword');
    if (
      firstName?.invalid ||
      lastName?.invalid ||
      email?.invalid ||
      phoneNumber?.invalid ||
      password?.invalid ||
      confirmPassword?.invalid
    ) {
      return false;
    }
    return true;
  }

  get isStep2Valid(): boolean {
    const businessName = this.registerForm.get('businessName');
    const displayName = this.registerForm.get('displayName');
    const businessCategory = this.registerForm.get('businessCategory');
    const businessDescription = this.registerForm.get('businessDescription');
    if (
      businessName?.invalid ||
      displayName?.invalid ||
      businessCategory?.invalid ||
      businessDescription?.invalid
    ) {
      return false;
    }
    return true;
  }

  get isStep3Valid(): boolean {
    const addressLine1 = this.registerForm.get('addressLine1');
    const country = this.registerForm.get('country');
    const state = this.registerForm.get('state');
    const city = this.registerForm.get('city');
    const postalCode = this.registerForm.get('postalCode');
    if (
      addressLine1?.invalid ||
      country?.invalid ||
      state?.invalid ||
      city?.invalid ||
      postalCode?.invalid
    ) {
      return false;
    }
    return true;
  }

  get isStep4Valid(): boolean {
    const gstNumber = this.registerForm.get('gstin');
    const panNumber = this.registerForm.get('panNumber');
    if (gstNumber?.invalid || panNumber?.invalid) {
      return false;
    }
    return true;
  }

  // back button
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  //next button
  nextStep(): void {
    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }

  // tab click button
  goToStep(step: number): void {
    this.currentStep = step;
  }

  get canAccessStep2(): boolean {
    return this.isStep1Valid;
  }

  get canAccessStep3(): boolean {
    return this.isStep1Valid && this.isStep2Valid;
  }

  get canAccessStep4(): boolean {
    return this.isStep1Valid && this.isStep2Valid && this.isStep3Valid;
  }

  get canAccessStep5(): boolean {
    return (
      this.isStep1Valid &&
      this.isStep2Valid &&
      this.isStep3Valid &&
      this.isStep4Valid
    );
  }
}
