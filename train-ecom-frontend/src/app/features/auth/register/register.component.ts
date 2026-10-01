import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { getFieldError, noSpaceAllow, passwordMatchValidator, trimControlValue } from '../register.utils';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm!: FormGroup;

  private fb = inject(FormBuilder);
  private routes = inject(Router);
  private store = inject(Store);

  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor() {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group(
      {
        name: [
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
      },
      { validators: passwordMatchValidator },
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      console.log('Form is invalid');
      return;
    }

    const requestData = this.registerForm.value;
    console.log('Validation Passed Dispatching to Store...', requestData);
    this.store.dispatch(AuthActions.registerReq({ request: requestData }));
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const isControlKey = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ].includes(event.key);
    if (isControlKey) {
      return true;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.registerForm.get(controlName);
    return getFieldError(control, label);
  }

  onBlurTrim(contronName: string): void {
    const control = this.registerForm.get(contronName);
    trimControlValue(control);
  }
}
