import { Component, inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as UserActions from '../../../../core/store/user/user.actions';
import { UserService } from '../../../../core/services/user.service';
import { Address } from '../../../../core/models/user.model';
import { DialogData, FieldConfig } from '../../../../core/models/dialog.model';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { OnDestroy } from '@angular/core';

type AddressFormResult = Omit<Address, 'id' | 'country'>;

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogServiceService);

  addresses: Address[] = [];

  ngOnInit(): void {
    this.getAddresses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAddresses(): void {
    this.userService
      .getAllAddress()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (addresses: Address[]) => {
          this.addresses = addresses;
        },
        error: (error: unknown) => {
          this.showError('Error fetching addresses');
        },
      });
  }

  private getAddressFields(address?: Address): FieldConfig[] {
    return [
      {
        key: 'fullName',
        label: 'Full Name',
        type: 'text',
        value: address?.fullName || '',
        validation: [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)],
      },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'text',
        value: address?.phone || '',
        validation: [Validators.required, Validators.pattern(/^\d{10}$/)],
        maxLength: 10,
      },
      {
        key: 'addressLine1',
        label: 'Address Line 1',
        type: 'text',
        value: address?.addressLine1 || '',
        validation: [Validators.required],
      },
      {
        key: 'addressLine2',
        label: 'Address Line 2 (Optional)',
        type: 'text',
        value: address?.addressLine2 || '',
      },
      {
        key: 'city',
        label: 'City',
        type: 'text',
        value: address?.city || '',
        validation: [Validators.required],
      },
      {
        key: 'state',
        label: 'State',
        type: 'text',
        value: address?.state || '',
        validation: [Validators.required],
      },
      {
        key: 'postalCode',
        label: 'Postal Code',
        type: 'text',
        value: address?.postalCode || '',
        validation: [Validators.required, Validators.pattern(/^\d{6}$/)],
        maxLength: 6,
      },
    ];
  }

  private getDialogConfig(address?: Address): DialogData {
    const isEdit = !!address;
    return {
      title: isEdit ? 'Update Address' : 'Add New Address',
      submitButtonText: isEdit ? 'Update Address' : 'Save Address',
      fields: this.getAddressFields(address),
      enableCurrentLocation: true,
    };
  }

  private formatAddressPayload(
    result: AddressFormResult,
    originalAddress?: Address,
  ): Address {
    return {
      ...result,
      id: originalAddress?.id || '',
      phone: String(result.phone),
      postalCode: String(result.postalCode),
      country: 'India',
      isDefault: originalAddress?.isDefault || false,
    } as Address;
  }

  private saveAddressData(payload: Address, isEdit: boolean): void {
    const request$ =
      isEdit && payload.id
        ? this.userService.updateAddress(payload.id, payload)
        : this.userService.addAddress(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showSuccess(
          `Address ${isEdit ? 'updated' : 'added'} successfully!`,
        );
        this.getAddresses();
        this.store.dispatch(UserActions.loadProfileReq());
      },
      error: (error: unknown) =>
        this.showError(`Failed to ${isEdit ? 'update' : 'add'} address.`),
    });
  }

  private openAddressDialog(address?: Address): void {
    const dialogConfig = this.getDialogConfig(address);

    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '600px',
      data: dialogConfig,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: AddressFormResult | undefined) => {
        if (!result) return;
        const payload = this.formatAddressPayload(result, address);
        this.saveAddressData(payload, !!address);
      });
  }

  openAddAddressDialog(): void {
    this.openAddressDialog();
  }

  editAddress(address: Address): void {
    this.openAddressDialog(address);
  }

  markAsDefault(id: string | number): void {
    this.userService
      .setDefaultAddress(Number(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Default address updated!');
          this.getAddresses();
          this.store.dispatch(UserActions.loadProfileReq());
        },
        error: (error: unknown) =>
          this.showError('Error updating default address.'),
      });
  }

  deleteAddress(id: string | number): void {
    this.confirmDialog
      .confirm(
        'Are you sure you want to delete this address?',
        'Delete',
        'Cancel',
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.userService
            .deleteAddress(Number(id))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSuccess('Address deleted successfully!');
                this.getAddresses();
                this.store.dispatch(UserActions.loadProfileReq());
              },
              error: (error: unknown) =>
                this.showError('Error deleting address.'),
            });
        }
      });
  }

  private showSuccess(message: string): void {
    this.notification.showSuccess(message);
  }

  private showError(message: string): void {
    this.notification.showError(message);
  }
}
