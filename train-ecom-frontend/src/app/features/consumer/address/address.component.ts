import { Component, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { Address } from '../../../core/models/user.model';
import { DialogData } from '../../../core/models/dialog.model';
import { Validators } from '@angular/forms';
import { GenericDialogComponent } from '../../../shared/components/generic-dialog/generic-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent {

  private userService = inject(UserService);
  addresses: Address[] = [];
  isLoading: boolean = false;
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.getAddresses();
  }

  getAddresses(): void {
    this.userService.getAllAddress().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoading = false;
        console.log('Addresses fetched successfully:', addresses);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching addresses:', error);
      }
    })
  }

  openAddAddressDialog(): void {
    const dialogConfig: DialogData = {
      title: 'Add New Address',
      submitButtonText: 'Save Address',
      fields: [
        { key: 'fullName', label: 'Full Name', type: 'text', validation: [Validators.required] },
        { key: 'phone', label: 'Phone Number', type: 'text', validation: [Validators.required, Validators.pattern(/^\d{10}$/)] },
        { key: 'addressLine1', label: 'Address Line 1', type: 'text', validation: [Validators.required] },
        { key: 'addressLine2', label: 'Address Line 2 (Optional)', type: 'text' },
        { key: 'city', label: 'City', type: 'text', validation: [Validators.required] },
        { key: 'state', label: 'State', type: 'text', validation: [Validators.required] },
        { key: 'postalCode', label: 'Postal Code', type: 'text', validation: [Validators.required] },
        { key: 'isDefault', label: 'Make this my default address', type: 'checkbox' }
      ]
    };
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '400px',
      data: dialogConfig
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const apiPayload = {
          ...result,
          country: 'India'
        }
        console.log('New address data:', result);

        this.userService.addAddress(apiPayload).subscribe({
          next: (response) => {
            console.log('User profile updated successfully:', response);
            this.getAddresses();
          },
          error: (error) => {
            console.error('Error updating user profile:', error);
          }
        });
      }
    })
  }

  editAddress(address: Address): void {
    const dialogConfig: DialogData = {
      title: 'Update Address',
      submitButtonText: 'Update Address',
      fields: [
        { key: 'fullName', label: 'Full Name', type: 'text', value: address.fullName, validation: [Validators.required] },
        { key: 'phone', label: 'Phone Number', type: 'text', value: address.phone, validation: [Validators.required, Validators.pattern(/^\d{10}$/)] },
        { key: 'addressLine1', label: 'Address Line 1', type: 'text', value: address.addressLine1, validation: [Validators.required] },
        { key: 'addressLine2', label: 'Address Line 2 (Optional)', type: 'text', value: address.addressLine2 },
        { key: 'city', label: 'City', type: 'text', value: address.city, validation: [Validators.required] },
        { key: 'state', label: 'State', type: 'text', value: address.state, validation: [Validators.required] },
        { key: 'postalCode', label: 'Postal Code', type: 'text', value: address.postalCode, validation: [Validators.required] },
        { key: 'isDefault', label: 'Make this my default address', type: 'checkbox', value: address.isDefault }
      ]
    };
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '400px', data: dialogConfig
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const apiPayload = {
          id: address.id,
          fullName: result.fullName,
          phone: String(result.phone),
          addressLine1: result.addressLine1,
          addressLine2: result.addressLine2 || null,
          city: result.city,
          state: result.state,
          postalCode: String(result.postalCode),
          country: 'India',
          isDefault: result.isDefault === true
        };

        this.userService.updateAddress(address.id, apiPayload).subscribe({
          next: (response) => {
            console.log('Address updated successfully:', response);
            this.getAddresses();
          },
          error: (error) => {
            console.error('Error updating address:', error);
          }
        })
      }
    })

  }

  deleteAddress(id: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.userService.deleteAddress(id).subscribe({
        next: () => {
          console.log('Address deleted successfully!');
          this.getAddresses();
        },
        error: (error) => console.error('Error deleting address:', error)
      });
    }
  }

}
