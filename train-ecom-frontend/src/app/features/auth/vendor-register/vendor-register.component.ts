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

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
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

  categories$!: Observable<Category[]>;
  registerForm!: FormGroup;

  isPasswordView: boolean = false;
  isConfirmPassView: boolean = false;

  ngOnInit() {
    this.initlizeForm();
    this.fetchAllCategory();
  }

  private initlizeForm(): void {
    this.registerForm = this.fb.group(
      {
        name: [
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
        storeName: ['', [Validators.required, Validators.minLength(3)]],
        businessDescription: [
          '',
          [Validators.required, Validators.minLength(10)],
        ],
        storeCategory: ['', Validators.required],
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

        bankAccountNumber: ['', [Validators.pattern(/^\d{9,16}$/)]],
        acountHolderName: [''],
        ifscCode: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      },
      { validators: passwordMatchValidator },
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    console.log('Registered Data: ', this.registerForm.value);
    const formData = new FormData();
    Object.keys(this.registerForm.controls).forEach((key) => {
      const value = this.registerForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    formData.forEach((key, value) => {
      console.log(`${key}:`, value);
    });
    this.registerForm.reset();
  }

  viewPassord() {
    this.isPasswordView = !this.isPasswordView;
  }

  viewConfirmPassword() {
    this.isConfirmPassView = !this.isConfirmPassView;
  }

  fetchAllCategory() {
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
}
