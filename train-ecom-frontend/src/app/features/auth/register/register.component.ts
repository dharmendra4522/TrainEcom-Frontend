import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
};


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm!: FormGroup;

  private fb = inject(FormBuilder);
  private routes = inject(Router);
  private store = inject(Store);

  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor() { }

  ngOnInit() {
    this.validateForm();
  }

  private validateForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator }
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
    const isControlKey = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key);
    if (isControlKey) {
      return true;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}
