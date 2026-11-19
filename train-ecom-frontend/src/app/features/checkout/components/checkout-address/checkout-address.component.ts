import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Address } from '../../../../core/models/user.model';
import {
  SelectionDialogComponent,
  SelectionDialogData,
} from '../../../../shared/components/selection-dialog/selection-dialog.component';
import { DialogData, FieldConfig } from '../../../../core/models/dialog.model';
import { Validators } from '@angular/forms';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { take } from 'rxjs/internal/operators/take';
import { noSpaceAllow, phoneNumberValidator, postalCodeValidator } from '../../../auth/register.utils';

export type AddressFormResult = Omit<Address, 'id' | 'isDefault'>;

@Component({
  selector: 'app-checkout-address',
  templateUrl: './checkout-address.component.html',
  styleUrl: './checkout-address.component.css',
})
export class CheckoutAddressComponent {
  private dialog = inject(MatDialog);

  // take addresses list  and selectedAddressId as input from parent component
  @Input() addresses: Address[] = [];
  @Input() selectedAddressId: number | null = null;

  //  Events to notify the parent component of an action
  @Output() selectAddress = new EventEmitter<number>();
  @Output() addAddress = new EventEmitter<AddressFormResult>();
  @Output() updateAddress = new EventEmitter<{
    id: number;
    address: AddressFormResult;
  }>();
  @Output() removeAddress = new EventEmitter<number>();

  //Returns the currently selected address object for display in the UI.
  get selectedAddress(): Address | undefined {
    return this.addresses.find(
      (address) => address.id === this.selectedAddressId
    );
  }

  private getAddressFields(address?: Address): FieldConfig[] {
    return [
      {
        key: 'fullName',
        label: 'Full Name',
        type: 'text',
        value: address?.fullName || '',
        validation: [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/), noSpaceAllow()]
      },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'text',
        value: address?.phone || '',
        validation: phoneNumberValidator,
        maxLength: 10
      },
      {
        key: 'addressLine1',
        label: 'Address Line 1',
        type: 'text',
        value: address?.addressLine1 || '',
        validation: [Validators.required, noSpaceAllow()]
      },
      {
        key: 'addressLine2',
        label: 'Address Line 2 (Optional)',
        type: 'text',
        value: address?.addressLine2 || ''
      },
      {
        key: 'country',
        label: 'Country',
        type: 'select',
        value: address?.country || 'India',
        validation: [Validators.required]
      },
      {
        key: 'state',
        label: 'State',
        type: 'select',
        value: address?.state || '',
        validation: [Validators.required]
      },
      {
        key: 'city',
        label: 'City',
        type: 'select',
        value: address?.city || '',
        validation: [Validators.required]
      },
      {
        key: 'postalCode',
        label: 'Postal Code',
        type: 'text',
        value: address?.postalCode || '',
        maxLength: 6,
        validation: postalCodeValidator
      }
    ];
  }

  private getDialogConfig(address?: Address): DialogData {
    const isEdit = !!address;
    return {
      title: isEdit ? 'Update Address' : 'Add New Address',
      submitButtonText: isEdit ? 'Update Address' : 'Save Address',
      fields: this.getAddressFields(address),
      enableCurrentLocation: true
    };
  }

  onChangeAddress(): void {
    const dialogData: SelectionDialogData<Address> = {
      title: 'Select Delivery Address',
      items: this.addresses,
      selectedId: this.selectedAddressId || '',
      displayKey: 'fullName',
      addButtonLabel: 'Add New Address'
    };
    this.dialog
      .open<
        SelectionDialogComponent<Address>,
        SelectionDialogData<Address>,
        Address | 'add' | { action: string; item: Address }
      >(SelectionDialogComponent, {
        width: '750px',
        data: dialogData,
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: 'add' | { action?: string; item?: Address; id?: number } | null | undefined) => {
        if (!result) return;

        setTimeout(() => {
          if (result === 'add') {
            this.onAddNewAddress();
          } else if (typeof result === 'object' && result.action === 'edit' && result.item) {
            this.onAddNewAddress(result.item); // Edit dialog open
          } else if (typeof result === 'object' && result.action === 'delete' && result.item) {
            this.deleteAddress(result.item.id); // Delete method call
          } else if (typeof result === 'object' && result.id !== undefined) {
            this.selectAddress.emit(Number(result.id));
          }
        }, 50);
      });
  }

  deleteAddress(id: number): void {
    this.removeAddress.emit(Number(id));
  }

  onAddNewAddress(address?: Address): void {
    const dialogConfig = this.getDialogConfig(address);
    this.dialog
      .open(GenericDialogComponent, {
        width: '550px',
        data: dialogConfig
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: AddressFormResult | undefined) => {
        if (!result) return;
        if (address && address.id) {
          this.updateAddress.emit({ id: address.id, address: result });
        } else {
          this.addAddress.emit(result);
        }
      });
  }
}
