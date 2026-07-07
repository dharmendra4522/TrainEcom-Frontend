import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPasswordControl = control.get('confirmPassword'); 

  if (password && confirmPasswordControl?.value && password !== confirmPasswordControl.value) {
    confirmPasswordControl.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPasswordControl?.hasError('passwordMismatch')) {
        confirmPasswordControl.setErrors(null);
    }
    return null;
  }
}
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

  constructor() { }

  ngOnInit() {
    this.validateForm();
  }

  private validateForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    const { confirmPassword, ...requestData } = this.registerForm.value;
    console.log('Validation Passed Dispatching to Store...', requestData);
    this.store.dispatch(AuthActions.registerReq({ request: requestData }));
    this.routes.navigate(['/auth/login']);
  }
}
