import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../../../core/models/category.model';
import { Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import * as CategoryActions from '../../../core/store/category/category.action';
import { selectAllCategories } from '../../../core/store/category/category.selectors';
import { NotificationService } from '../../../core/services/notification.service';
import { Country, State, City } from 'country-state-city';
import { ICountry, IState, ICity } from 'country-state-city';
import { MatSelectChange } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import {
  VendorRegisterFormValues,
  VendorRegisterResponse,
} from '../../../core/models/auth.model';
import {
  bankDetailsValidator,
  createVendorFormData,
  fileValidator,
  noSpaceAllow,
  passwordMatchValidator,
} from '../register.utils';

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
  isLoading: boolean = false;

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
            noSpaceAllow(),
            Validators.pattern(/^[a-zA-Z\s]+$/),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            noSpaceAllow(),
            Validators.pattern(/^[a-zA-Z\s]+$/),
          ],
        ],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        businessName: ['', [Validators.required, Validators.minLength(3)]],
        displayName: ['', [Validators.required, Validators.minLength(3)]],
        bussinessDescription: [
          '',
          [Validators.required, Validators.minLength(10), noSpaceAllow()],
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
              /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
            ),
          ],
        ],
        panNumber: [
          '',
          [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)],
        ],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        country: ['India', Validators.required],
        state: ['', Validators.required],
        postalCode: [
          '',
          [Validators.required, Validators.pattern(/^(?!0{6})\d{6}$/)],
        ],

        bankAccountNumber: ['', [Validators.pattern(/^\d{9,18}$/)]],
        acountHolderName: [
          '',
          [Validators.pattern(/^[a-zA-Z\s]+$/), noSpaceAllow()],
        ],
        ifscCode: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      },
      { validators: [passwordMatchValidator, bankDetailsValidator()] }
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

    this.isLoading = true;
    const formData = createVendorFormData(
      this.registerForm.value as VendorRegisterFormValues,
    );
    this.authService.vendorRegister(formData).subscribe({
      next: (res: VendorRegisterResponse) => {
        this.isLoading = false;
        this.notificationService.showSuccess(
          res.message || 'Registration successful',
        );
        this.registerForm.reset();
        this.route.navigate(['/login']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading = false;
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

  private checkStepValidity(controlNames: string[]): boolean {
    return controlNames.every((name) => {
      const control = this.registerForm.get(name);
      return control && control.valid;
    });
  }

  // getter function for disable the next button
  get isStep1Valid(): boolean {
    return this.checkStepValidity([
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'password',
      'confirmPassword',
    ]);
  }

  get isStep2Valid(): boolean {
    return this.checkStepValidity([
      'businessName',
      'displayName',
      'businessCategory',
      'bussinessDescription',
    ]);
  }

  get isStep3Valid(): boolean {
    return this.checkStepValidity([
      'addressLine1',
      'country',
      'state',
      'city',
      'postalCode',
    ]);
  }

  get isStep4Valid(): boolean {
    const isGstPanValid = this.checkStepValidity(['gstin', 'panNumber']);

    const isBankGroupValid = !this.registerForm.errors?.['bankIncomplete'];
    const areBankFieldsValid =
      !!this.registerForm.get('bankAccountNumber')?.valid &&
      !!this.registerForm.get('acountHolderName')?.valid &&
      !!this.registerForm.get('ifscCode')?.valid;

    return isGstPanValid && isBankGroupValid && areBankFieldsValid;
  }

  // back button
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  //next button
  nextStep(): void {
    // Current step ke mutabiq validation check karein
    if (this.currentStep === 1 && !this.isStep1Valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (this.currentStep === 2 && !this.isStep2Valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (this.currentStep === 3 && !this.isStep3Valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (this.currentStep === 4 && !this.isStep4Valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

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
