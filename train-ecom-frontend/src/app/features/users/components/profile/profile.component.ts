import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { UserProfile, UpdateProfilePayload } from '../../../../core/models/user.model';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectUserError, selectUserIsLoading, selectUserProfile } from '../../../../core/store/user/use.selectors';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import * as UserActions from '../../../../core/store/user/user.actions';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {

  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private userStore = inject(Store);
  private notification = inject(NotificationService);


  // Observables for state
  isLoading$ = this.userStore.select(selectUserIsLoading);
  error$ = this.userStore.select(selectUserError);
  userProfile$ = this.userStore.select(selectUserProfile);

  userProfile: UserProfile | null = null;
  isLoading: boolean = true;
  isEditMode: boolean = false;
  isChangingPassword: boolean = false;
  profileForm!: FormGroup;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
    this.fetchUserProfile();
    this.subscribeToStoreData();
  }

  private initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  fetchUserProfile(): void {
    this.userStore.dispatch(UserActions.loadProfileReq());
  }

  private subscribeToStoreData(): void {
    this.userProfile$.pipe(takeUntil(this.destroy$)).subscribe(profile => {
      this.handleIncomingProfile(profile);
    });
  }

  private handleIncomingProfile(profile: UserProfile | null): void {
    this.userProfile = profile;
    if (profile) {
      this.patchFormWithData(profile);
    }
  }

  private patchFormWithData(profile: UserProfile): void {
    this.profileForm.patchValue({
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.isChangingPassword = false;
    if (!this.isEditMode && this.userProfile) {
      this.patchFormWithData(this.userProfile);
    }
  }

  togglePasswordFields(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.profileForm.patchValue({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const formValues = this.profileForm.value;

    const payload: UpdateProfilePayload = {
      name: formValues.name,
      phoneNumber: formValues.phoneNumber,
    };

    if (this.isChangingPassword && formValues.oldPassword) {
      payload.oldPassword = formValues.oldPassword;
      payload.newPassword = formValues.newPassword;
      payload.confirmPassword = formValues.confirmPassword;
    }
    this.updateProfileOnServer(payload);
  }

  private updateProfileOnServer(payload: UpdateProfilePayload): void {
    this.userService.updateUserProfile(payload).subscribe({
      next: () => {
        this.onProfileUpdateSuccess();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 200 || error.status === 204) {
          this.onProfileUpdateSuccess();
        } else {
          this.onProfileUpdateError(error);
        }
      }
    });
  }

  private onProfileUpdateSuccess(): void {
    this.profileForm.patchValue({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    this.isEditMode = false;
    this.isChangingPassword = false;

    this.userStore.dispatch(UserActions.loadProfileReq());

    this.notification.showSuccess('Profile updated successfully!');
  }

  private onProfileUpdateError(err: HttpErrorResponse): void {
    console.error('Error updating profile:', err);
    const errorMessage = err.error?.message || err.error?.title || 'Failed to update profile. Please check your details.';
    this.notification.showError(errorMessage);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}