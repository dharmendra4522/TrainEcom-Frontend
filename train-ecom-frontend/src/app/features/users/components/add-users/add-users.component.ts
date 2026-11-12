import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { getFieldError, trimControlValue } from '../../../auth/register.utils';
import { Store } from '@ngrx/store';
import { Role } from '../../../../core/models/auth.model';
import { selectUserRole } from '../../../../core/store/auth/auth.selectors';
import { StaffService } from '../../../../core/services/staff.service';

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

  isSubmitting: boolean = false;
  staffForm!: FormGroup;
  isPasswordView: boolean = false;
  readonly role = Role;
  userRole$ = this.store.select(selectUserRole);

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.staffForm = this.fb.group({
      staffName: ['', Validators.required],
      staffEmail: ['', Validators.compose([Validators.required, Validators.email])],
      staffPhoneNumber: ['', Validators.required],
      staffRole: ['', Validators.required],
      staffPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ])
      ],
    })
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
    console.log('form data', payload);
    this.staffService.addStaffUsers(payload).subscribe({
      next: (response) => {
        console.log('Staff user added successfully:', response);
        this.isSubmitting = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding staff user:', error);
      }
    });
  }

  // role options for dropdown
  roleOptions = [
    { label: 'Accountant', value: Role.Accountant },
    { label: 'StoreMananger', value: Role.StoreMananger },
    { label: 'InventoryManager', value: Role.InventoryManager },
    { label: 'OrderManager ', value: Role.OrderManager },
    { label: 'CustomerSupport ', value: Role.CustomerSupport },
    { label: 'ProductEditor ', value: Role.ProductEditor }
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
