import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../../../core/models/dialog.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NominatimAddress } from '../../../core/models/auth.model';

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.css',
})
export class GenericDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  dynamicForm!: FormGroup;
  isLoadingLocation = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<GenericDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.buildDynamicForm();
  }

  buildDynamicForm(): void {
    const group: Record<string, unknown> = {};
    this.data.fields.forEach((field) => {
      let defaultValue =
        field.value !== undefined
          ? field.value
          : field.type === 'checkbox'
            ? false
            : '';
      let validations = field.validation || [];
      if (field.required) {
        validations = [...validations, Validators.required];
      }
      group[field.key] = [defaultValue, validations];
    });
    this.dynamicForm = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      this.dialogRef.close(this.dynamicForm.value);
    }
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.notificationService.showError('Geolocation is not supported by your browser.');
      return;
    }

    this.isLoadingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.authService
          .getCurrentAddress(position.coords.latitude, position.coords.longitude)
          .subscribe({
            next: (response) => {
              this.patchLocationAddress(response.address);
              this.isLoadingLocation = false;
            },
            error: () => {
              this.isLoadingLocation = false;
              this.notificationService.showError('Failed to fetch current address.');
            },
          });
      },
      () => {
        this.isLoadingLocation = false;
        this.notificationService.showError('Unable to access current location.');
      },
    );
  }

  private patchLocationAddress(address: NominatimAddress): void {
    const addressLine1 = [
      address.house_number,
      address.road,
      address.industrial,
      address.suburb,
    ]
      .filter((value): value is string => !!value)
      .join(', ');
    const city = address.city || address.town || address.village || address.hamlet || '';

    const locationValues: Record<string, string> = {
      addressLine1,
      city,
      state: address.state || '',
      postalCode: address.postcode || '',
    };

    Object.entries(locationValues).forEach(([key, value]) => {
      if (this.dynamicForm.contains(key)) {
        this.dynamicForm.get(key)?.setValue(value);
        this.dynamicForm.get(key)?.markAsDirty();
        this.dynamicForm.get(key)?.markAsTouched();
      }
    });
  }
}
