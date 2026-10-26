import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '../../../../core/store/user/user.selectors';
import {
  ProfileVendorDetails,
  UserProfile,
  ApprovalStatus
} from '../../../../core/models/user.model';
import { normalizeApprovalStatus } from '../../../../core/utils/role.utils';
import { selectAuthStatus } from '../../../../core/store/auth/auth.selectors';
import { DocumentType, ProfileFieldConfig, VendorTabConfig } from '../../../../core/models/vendor.model';
import {
  VENDOR_PROFILE_TABS,
} from './vendor-profile.constants';

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styleUrl: './vendor-profile.component.css'
})
export class VendorProfileComponent implements OnInit {
  private store = inject(Store);

  isEditMode: boolean = false;
  userProfile$ = this.store.select(selectUserProfile);
  // password visibility toggles
  vendorData: ProfileVendorDetails | null = null;
  userProfileData: UserProfile | null = null;

  tabConfig: VendorTabConfig[] = VENDOR_PROFILE_TABS;
  isSaving: boolean = false;
  authStatus: string | null = null;

  ngOnInit(): void {
    this.subscribeAuthStatus();
    this.fetchVendorDetails();
  }

  // subscribe Auth status from store
  private subscribeAuthStatus(): void {
    this.store.select(selectAuthStatus).subscribe((status) => {
      this.authStatus = status;
    });
  }

  // fetch vendor details from user profile and patch the form
  private fetchVendorDetails(): void {
    this.userProfile$.subscribe((profile) => {
      if (profile) {
        this.userProfileData = profile;
        this.vendorData = profile.vendorDetails ?? null;
        if (this.vendorData?.documents?.length) {
          const urls: string[] = [];
          this.vendorData.documents.forEach((doc) => {
            if (doc.documentType === DocumentType.Logo) urls[0] = doc.documentUrl;
            if (doc.documentType === DocumentType.BussinessDocument) urls[1] = doc.documentUrl;
            if (doc.documentType === DocumentType.GSTDocument) urls[2] = doc.documentUrl;
          });
          this.vendorData = {
            ...this.vendorData,
            documentUrls: urls
          };
        }
      }
    });
  }

  getDocumentUrl(documentType: number): string | null {
    const document = this.vendorData?.documents?.find(
      (item) =>
        item.documentType === documentType && !!item.documentUrl,
    );
    return (
      document?.documentUrl ||
      this.vendorData?.documentUrls?.[documentType - 1] ||
      null
    );
  }

  get vendorCategories(): string[] {
    return this.vendorData?.categories ?? [];
  }

  // toggle edit mode only if vendor is approved
  toggleEditMode(): void {
    if (!this.isApprovedVendor) {
      return;
    }
    this.isEditMode = !this.isEditMode;
  }

  get isApprovedVendor(): boolean {
    const approvalValue = this.authStatus ?? localStorage.getItem('vendorStatus');
    return normalizeApprovalStatus(approvalValue) === ApprovalStatus.Approved;
  }


  getTabFields(tabLabel: string): ProfileFieldConfig[] {
    const matchedTab = this.tabConfig.find((t) => t.label === tabLabel);
    return matchedTab ? matchedTab.fields : [];
  }

  getFieldValue(key: string): string | number | null | undefined {
    if (key === 'name') {
      return this.userProfileData?.name;
    }
    if (key === 'email') {
      return this.userProfileData?.email;
    }
    if (key === 'phoneNumber') {
      return this.userProfileData?.phoneNumber;
    }
    if (this.vendorData) {
      const vendorKey = key as keyof ProfileVendorDetails;
      const value = this.vendorData[vendorKey];

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        value === null ||
        value === undefined
      ) {
        return value;
      }
    }
    return null;
  }
}
