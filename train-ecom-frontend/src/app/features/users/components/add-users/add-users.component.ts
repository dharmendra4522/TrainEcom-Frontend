import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getFieldError, trimControlValue } from '../../../auth/register.utils';
import { Store } from '@ngrx/store';
import { Role } from '../../../../core/models/auth.model';
import { selectUserRole } from '../../../../core/store/auth/auth.selectors';
import { StaffService } from '../../../../core/services/staff.service';
import { StaffUser } from '../../../../core/models/staffUser.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.css'
})
export class AddUsersComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddUsersComponent>);
  private store = inject(Store);
  private staffService = inject(StaffService);
  private notificationService = inject(NotificationService);
  public data = inject(MAT_DIALOG_DATA, { optional: true });

  isSubmitting: boolean = false;
  staffForm!: FormGroup;
  isPasswordView: boolean = false;
  readonly role = Role;
  userRole$ = this.store.select(selectUserRole);

  ngOnInit(): void {
    this.initializeForm();
    if (this.data?.isEdit && this.data?.staffData) {
      this.patchFormValues(this.data.staffData);
    }
  }

  private initializeForm(): void {
    this.staffForm = this.fb.group({
      staffName: ['', Validators.required],
      staffEmail: ['', Validators.compose([Validators.required, Validators.email])],
      staffPhoneNumber: ['', Validators.compose([Validators.required, Validators.pattern(/^[6-9]\d{9}$/)])],
      staffRole: [[], Validators.required],
      staffPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ])
      ]
    })
  }

  // patch form values for edit
  private patchFormValues(staffUser: StaffUser): void {
    this.staffForm.patchValue({
      staffName: staffUser.name,
      staffEmail: staffUser.email,
      staffPhoneNumber: staffUser.phoneNumber,
      staffRole: Array.isArray(staffUser.role) ? staffUser.role : [staffUser.role]
    });
    this.staffForm.get('staffEmail')?.disable();
    const passwordControl = this.staffForm.get('staffPassword');
    passwordControl?.clearValidators();
    passwordControl?.updateValueAndValidity();
  }

  // handle form submition
  onSubmit(): void {
    this.isSubmitting = true;
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }
    const payload = {
      name: this.staffForm.get('staffName')?.value,
      email: this.staffForm.get('staffEmail')?.value,
      phoneNumber: this.staffForm.get('staffPhoneNumber')?.value,
      role: this.staffForm.get('staffRole')?.value,
      password: this.staffForm.get('staffPassword')?.value
    }
    if (this.data?.isEdit && this.data?.staffData) {
      this.updateStaffUser(this.data.staffData.id, payload);
    }
    else {
      this.staffService.addStaffUsers(payload).subscribe({
        next: () => {
          this.notificationService.showSuccess('Staff user added successfully', 'Close');
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.notificationService.showError('Failed to add staff user', 'Close');
        }
      });
    }
  }

  // handle update staff user
  private updateStaffUser(userId: number, updatedData: Partial<StaffUser>): void {
    this.staffService.updateStaffUserDetails(userId, updatedData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Staff user updated successfully', 'Close');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notificationService.showError('Failed to update staff user', 'Close');
        this.isSubmitting = false;
      }
    });
  }

  // role options for dropdown
  roleOptions = [
    { label: 'Accountant', value: Role.Accountant },
    { label: 'Store Mananger', value: Role.StoreMananger },
    { label: 'Inventory Manager', value: Role.InventoryManager },
    { label: 'Order Manager ', value: Role.OrderManager },
    { label: 'Customer Support ', value: Role.CustomerSupport },
    { label: 'Product Editor ', value: Role.ProductEditor }
  ]

  // handle close dialog
  onClose(): void {
    this.dialogRef.close();
  }

  //handle error message 
  getErrorMessage(controlName: string, label: string): string {
    const control = this.staffForm.get(controlName);
    return getFieldError(control, label);
  }

  onBlurTrim(controlName: string): void {
    const control = this.staffForm.get(controlName);
    trimControlValue(control);
  }

  // handle visibility of password
  viewPassword(): void {
    this.isPasswordView = !this.isPasswordView;
  }
}
