import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '../../../../core/store/user/user.selectors';
import { ProfileVendorDetails, UserProfile } from '../../../../core/models/user.model';

interface ProfileField {
  label: string;
  value: string | number | null | undefined;
  isList?: boolean;
  isLink?: boolean;
  listItems?: string[] | null;
  isFullWidth?: boolean;
}

interface TabConfig {
  label: string;
  fields: ProfileField[];
}

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styleUrl: './vendor-profile.component.css'
})
export class VendorProfileComponent implements OnInit {
  private store = inject(Store);

  isEditMode: boolean = false;
  userProfile$ = this.store.select(selectUserProfile);

  vendorData: ProfileVendorDetails | null = null;
  userProfileData: UserProfile | null = null;

  vendorsTabs: TabConfig[] = [];

  ngOnInit(): void {
    this.fetchVendorDetails();
  }

  private fetchVendorDetails(): void {
    this.userProfile$.subscribe((profile) => {
      if (profile) {
        this.userProfileData = profile;
        this.vendorData = profile.vendorDetails || null;
        this.buildTabConfigurations();
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  // Map data in label-value format for display in UI
  private buildTabConfigurations(): void {
    if (!this.vendorData || !this.userProfileData) {
      return;
    }
    const v = this.vendorData;
    const u = this.userProfileData;

    this.vendorsTabs = [
      {
        label: 'General Information',
        fields: [
          { label: 'Full Name', value: u?.name },
          { label: 'Email Address', value: u?.email },
          { label: 'Phone Number', value: u?.phoneNumber }
        ]
      },
      {
        label: 'Business',
        fields: [
          { label: 'Business Name', value: v?.bussinessName },
          { label: 'Display Name', value: v?.storeName },
          { label: 'Business Description', value: v?.bussinessDescription },
          { label: 'Categories', value: null, isList: true, listItems: v?.categories }
        ]
      },
      {
        label: 'Address',
        fields: [
          { label: 'Address Line 1', value: v?.addressLine1 },
          { label: 'Address Line 2', value: v?.addressLine2 },
          { label: 'City', value: v?.city },
          { label: 'State', value: v?.state },
          { label: 'Country', value: v?.country },
          { label: 'Postal Code', value: v?.postalCode }
        ]
      },
      {
        label: 'Account & Tax',
        fields: [
          { label: 'GSTIN', value: v?.gstin },
          { label: 'PAN Number', value: v?.pan },
          { label: 'Account Holder Name', value: v?.accountHolderName },
          { label: 'Bank Account Number', value: v?.bankAccountNumber },
          { label: 'IFSC Code', value: v?.ifscCode },
        ]
      },
      {
        label: 'Documents',
        fields: [
          { label: 'Business Registration Document', value: v?.documentUrls?.[0] || 'Not provided', isLink: true },
          { label: 'GST Document', value: v?.documentUrls?.[1] || 'Not provided', isLink: true },
          { label: 'Business Logo / Other Document', value: v?.documentUrls?.[2] || 'Not provided', isLink: true }
        ]
      }
    ];
  }
}