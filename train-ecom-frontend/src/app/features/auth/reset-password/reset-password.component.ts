import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css', '../login/login.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isShowingPassword = false;
  isShowingConfirmPassword = false;
  token: string | null = null;
  email: string | null = null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      this.email = params['email'] || null;
      console.log('Token and Email from URL:', this.token, this.email);
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      const confirmCtrl = control.get('confirmPassword');
      if (confirmCtrl?.hasError('mismatch')) {
        delete confirmCtrl.errors?.['mismatch'];
        confirmCtrl.updateValueAndValidity({ onlySelf: true });
      }
      return null;
    }
  }

  togglePasswordVisibility(): void {
    this.isShowingPassword = !this.isShowingPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isShowingConfirmPassword = !this.isShowingConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const { password } = this.resetPasswordForm.value;
      console.log('Sending reset password request with:', { email: this.email, token: this.token, newPassword: password });
      // API call to be implemented later
    }
  }
}
