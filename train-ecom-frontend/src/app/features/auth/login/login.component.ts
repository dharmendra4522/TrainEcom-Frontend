import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthError } from '../../../core/store/auth/auth.selectors';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { map } from 'rxjs/internal/operators/map';
import { BackendError } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

export const passwordMatchValidator = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

type AuthStep = 'LOGIN' | 'FORGOT_EMAIL' | 'FORGOT_RESET_PASSWORD';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  currentStep: AuthStep = 'LOGIN';
  isLoading: boolean = false;

  loginForm!: FormGroup;
  emailForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  private store = inject(Store);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Login variables
  isShowingPassword = false;

  // Forgot password variables
  userEmail: string = '';
  resendTimer: number = 0;
  expiryTimer: number = 300; // 5 minutes
  timerInterval: any;
  isShowingNewPassword = false;
  isShowingConfirmPassword = false;

  error$ = this.store.select(selectAuthError).pipe(
    map(err => {
      if (!err) return null; 

      let errorMessage = 'An unexpected error occurred';

      if (typeof err === 'string') {
        errorMessage = err;
      } else if (typeof err === 'object') {
        const errorObj = err as BackendError; 
        errorMessage = errorObj?.error?.message || errorObj?.message || errorMessage;
      }

      if (errorMessage.includes('0 Unknown Error')) return 'Unable to connect to the server...';
      if (errorMessage.toLowerCase().includes('unauthorized')) return 'Incorrect Email or Password...';
      
      return errorMessage; 
    })
  );

  ngOnInit() {
    this.validateForm();
  }

  private validateForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetPasswordForm = this.fb.group(
      {
        otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{6,}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [passwordMatchValidator],
      }
    );
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.store.dispatch(
      AuthActions.loginReq({ request: this.loginForm.value }),
    );
  }

  togglePasswordVisibility() {
    this.isShowingPassword = !this.isShowingPassword;
  }

  // ==== Forgot Password Logic ====

  goToForgotPassword() {
    this.currentStep = 'FORGOT_EMAIL';
  }

  goBackToLogin() {
    this.currentStep = 'LOGIN';
    this.emailForm.reset();
    this.resetPasswordForm.reset();
  }

  goBackToEmail() {
    this.currentStep = 'FORGOT_EMAIL';
    this.resetPasswordForm.reset();
  }

  onSendOtp(): void {
    if (this.isLoading) return;
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.userEmail = this.emailForm.value.email;

    this.authService.sendForgotPasswordOtp(this.userEmail).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.showSuccess(
          response.message || 'OTP sent successfully!',
        );
        this.currentStep = 'FORGOT_RESET_PASSWORD';
        this.startTimers();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage =
          err?.error?.message || 'Failed to send OTP. Please try again.';
        this.notificationService.showError(errorMessage);
      },
    });
  }

  onResetPassword(): void {
    if (this.isLoading) return;
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const payload = {
      email: this.userEmail,
      otp: this.resetPasswordForm.value.otp,
      newPassword: this.resetPasswordForm.value.newPassword,
      confirmPassword: this.resetPasswordForm.value.confirmPassword,
    };
    this.authService.resetPasswordWithOtp(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notificationService.showSuccess(
          res.message || 'Password reset successfully!',
        );
        this.goBackToLogin();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage =
          err?.error?.message || 'Failed to reset password. Invalid or expired OTP.';
        this.notificationService.showError(errorMessage);
      },
    });
  }

  toggleNewPasswordVisibility() {
    this.isShowingNewPassword = !this.isShowingNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.isShowingConfirmPassword = !this.isShowingConfirmPassword;
  }

  startTimers() {
    this.resendTimer = 60;
    this.expiryTimer = 300; // 5 minutes
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.resendTimer > 0) this.resendTimer--;
      if (this.expiryTimer > 0) this.expiryTimer--;
      
      if (this.resendTimer <= 0 && this.expiryTimer <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  get formattedExpiryTime(): string {
    const minutes = Math.floor(this.expiryTimer / 60);
    const seconds = this.expiryTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
