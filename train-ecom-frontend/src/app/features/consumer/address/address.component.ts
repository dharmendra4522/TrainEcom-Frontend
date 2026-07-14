import { Component, inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { Address } from '../../../core/models/user.model';
import { DialogData, FieldConfig } from '../../../core/models/dialog.model';
import { GenericDialogComponent } from '../../../shared/components/generic-dialog/generic-dialog.component';

type AddressFormResult = Omit<Address, 'id' | 'country'>;

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent implements OnInit {

  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  addresses: Address[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    this.getAddresses();
  }


  getAddresses(): void {
    this.isLoading = true;
    this.userService.getAllAddress().subscribe({
      next: (addresses: Address[]) => {
        this.addresses = addresses;
        this.isLoading = false;
        console.log('Addresses fetched successfully');
      },
      error: (error: unknown) => {
        this.isLoading = false;
        console.error('Error fetching addresses:', error);
      }
    });
  }


  private getAddressFields(address?: Address): FieldConfig[] {
    return [
      { key: 'fullName', label: 'Full Name', type: 'text', value: address?.fullName || '', validation: [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)] },
      { key: 'phone', label: 'Phone Number', type: 'text', value: address?.phone || '', validation: [Validators.required, Validators.pattern(/^\d{10}$/)], maxLength: 10 },
      { key: 'addressLine1', label: 'Address Line 1', type: 'text', value: address?.addressLine1 || '', validation: [Validators.required] },
      { key: 'addressLine2', label: 'Address Line 2 (Optional)', type: 'text', value: address?.addressLine2 || '' },
      { key: 'city', label: 'City', type: 'text', value: address?.city || '', validation: [Validators.required] },
      { key: 'state', label: 'State', type: 'text', value: address?.state || '', validation: [Validators.required] },
      { key: 'postalCode', label: 'Postal Code', type: 'text', value: address?.postalCode || '', validation: [Validators.required], maxLength: 6 },
      { key: 'isDefault', label: 'Make this my default address', type: 'checkbox', value: address?.isDefault || false }
    ];
  }


  private getDialogConfig(address?: Address): DialogData {
    const isEdit = !!address;
    return {
      title: isEdit ? 'Update Address' : 'Add New Address',
      submitButtonText: isEdit ? 'Update Address' : 'Save Address',
      fields: this.getAddressFields(address)
    };
  }


  private formatAddressPayload(result: AddressFormResult, addressId?: string): Address {
    return {
      ...result,
      id: addressId || '',
      phone: String(result.phone),
      postalCode: String(result.postalCode),
      country: 'India',
      isDefault: result.isDefault === true
    } as Address;
  }


  private saveAddressData(payload: Address, isEdit: boolean): void {
    const request$ = isEdit && payload.id
      ? this.userService.updateAddress(payload.id, payload)
      : this.userService.addAddress(payload);

    request$.subscribe({
      next: () => {
        console.log(`Address ${isEdit ? 'updated' : 'added'} successfully!`);
        this.getAddresses();
      },
      error: (error: unknown) => console.error(`Error saving address:`, error)
    });
  }


  private openAddressDialog(address?: Address): void {
    const dialogConfig = this.getDialogConfig(address);

    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '500px',
      data: dialogConfig
    });

    dialogRef.afterClosed().subscribe((result: AddressFormResult | undefined) => {
      if (!result) return;

      const payload = this.formatAddressPayload(result, address?.id);
      this.saveAddressData(payload, !!address);
    });
  }

  openAddAddressDialog(): void {
    this.openAddressDialog();
  }

  editAddress(address: Address): void {
    this.openAddressDialog(address);
  }

  deleteAddress(id: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.userService.deleteAddress(id).subscribe({
        next: () => {
          console.log('Address deleted successfully!');
          this.getAddresses();
        },
        error: (error: unknown) => console.error('Error deleting address:', error)
      });
    }
  }
}