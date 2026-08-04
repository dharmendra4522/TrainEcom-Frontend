import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Address } from '../../../../core/models/user.model';
import { SelectionDialogComponent, SelectionDialogData } from '../../../../shared/components/selection-dialog/selection-dialog.component';
import { DialogData } from '../../../../core/models/dialog.model';
import { Validators } from '@angular/forms';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { take } from 'rxjs/internal/operators/take';

export type AddressFormResult = Omit<Address, 'id' | 'country' | 'isDefault'>;

// Dialog configuration for adding a new address, including form fields and validation rules.
const ADD_ADDRESS_DIALOG_CONFIG: DialogData = {
  title: 'Add New Address',
  fields: [
    {
      key: 'fullName',
      label: 'Full Name',
      type: 'text',
      validation: [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)],
    },
    {
      key: 'phone',
      label: 'Phone Number',
      type: 'text',
      validation: [Validators.required, Validators.pattern(/^\d{10}$/)],
    },
    {
      key: 'addressLine1',
      label: 'Address Line 1',
      type: 'text',
      validation: [Validators.required],
    },
    {
      key: 'addressLine2',
      label: 'Address Line 2 (Optional)',
      type: 'text',
    },
    {
      key: 'city',
      label: 'City',
      type: 'text',
      validation: [Validators.required],
    },
    {
      key: 'state',
      label: 'State',
      type: 'text',
      validation: [Validators.required],
    },
    {
      key: 'postalCode',
      label: 'Postal Code',
      type: 'text',
      maxLength: 6,
      validation: [Validators.required, Validators.pattern(/^\d{6}$/)],
    },
  ],
  submitButtonText: 'Save Address',
}


@Component({
  selector: 'app-checkout-address',
  templateUrl: './checkout-address.component.html',
  styleUrl: './checkout-address.component.css'
})
export class CheckoutAddressComponent {
  private dialog = inject(MatDialog);


  // take addresses list  and selectedAddressId as input from parent component
  @Input() addresses: Address[] = [];
  @Input() selectedAddressId: string | null = null;


  //  Events to notify the parent component of an action
  @Output() selectAddress = new EventEmitter<string>();
  @Output() addAddress = new EventEmitter<AddressFormResult>();

  //Returns the currently selected address object for display in the UI.
  get selectedAddress(): Address | undefined {
    return this.addresses.find(address => address.id === this.selectedAddressId);
  }


  onChangeAddress(): void {
    const dialogData: SelectionDialogData<Address> = {
      title: 'Select Delivery Address',
      items: this.addresses,
      selectedId: this.selectedAddressId || '',
      displayKey: 'fullName',
      addButtonLabel: 'Add New Address'
    }
    this.dialog
      .open<SelectionDialogComponent<Address>, SelectionDialogData<Address>, Address | 'add'>(
        SelectionDialogComponent,
        {
          width: '750px',
          data: dialogData,
        }
      ).afterClosed().pipe(take(1)).subscribe((result) => {
        if (result === 'add') {
          this.onAddNewAddress(); // Trigger the add address flow
        } else if (result) {
          this.selectAddress.emit(result.id);  // Emit the selected address ID to the parent component
        }
      })
  }

  onAddNewAddress(): void {
    this.dialog.open(GenericDialogComponent, {
      width: '550px',
      data: ADD_ADDRESS_DIALOG_CONFIG,
    }).afterClosed().pipe(take(1)).subscribe((result: AddressFormResult | undefined) => {
      if (result) {
        this.addAddress.emit(result); // Emit the new address data to the parent component
      }
    })
  }

}
