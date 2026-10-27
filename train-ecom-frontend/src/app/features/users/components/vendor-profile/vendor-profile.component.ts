import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '../../../../core/store/user/user.selectors';
import {
  UserProfile,
  ApprovalStatus
} from '../../../../core/models/user.model';
import { normalizeApprovalStatus } from '../../../../core/utils/role.utils';
import { selectAuthStatus } from '../../../../core/store/auth/auth.selectors';
import { DocumentType } from '../../../../core/models/vendor.model';
import {
  VENDOR_PROFILE_TABS,
} from './vendor-profile.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styleUrl: './vendor-profile.component.css'
})
export class VendorProfileComponent implements OnInit {
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  isEditMode: boolean = false;
  userProfileData: UserProfile | null = null;
  authStatus: string | null = null;
  documentUrlMap: Record<number, string | null> = {};
  fieldValues: Record<string, string | null> = {};
  readonly tabs = VENDOR_PROFILE_TABS;
  vendorCategories: string[] = [];

  ngOnInit(): void {
    this.subscribeAuthStatus();
    this.fetchVendorDetails();
  }

  // subscribe Auth status from store
  private subscribeAuthStatus(): void {
    this.store.select(selectAuthStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((status) => {
      this.authStatus = status;
    });
  }

  // fetch vendor details from user profile and patch the form
  private fetchVendorDetails(): void {
    this.store.select(selectUserProfile).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((profile) => {
      if (!profile) {
        return;
      }
      this.userProfileData = profile;
      this.setDocumentUrls();
      this.setVendorCategories();
      this.setFieldValues(profile);
    });
  }

  // handle set document urls for each document type
  private setDocumentUrls(): void {
    const documentUrlMap: Record<number, string | null> = {
      [DocumentType.Logo]: null,
      [DocumentType.BussinessDocument]: null,
      [DocumentType.GSTDocument]: null
    };
    this.userProfileData?.vendorDetails?.documents?.forEach((doc) => {
      documentUrlMap[doc.documentType] = doc.documentUrl;
    });
    this.documentUrlMap = documentUrlMap;
  }

  // handle vendor categories
  private setVendorCategories(): void {
    this.vendorCategories = this.userProfileData?.vendorDetails?.categories ?? [];
  }

  // hendle set field values for each field in the profile
  private setFieldValues(profile: UserProfile): void {
    const vendor = profile.vendorDetails;
    this.fieldValues = {
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      bussinessName: vendor?.bussinessName ?? null,
      storeName: vendor?.storeName ?? null,
      bussinessDescription: vendor?.bussinessDescription ?? null,
      addressLine1: vendor?.addressLine1 ?? null,
      addressLine2: vendor?.addressLine2 ?? null,
      city: vendor?.city ?? null,
      state: vendor?.state ?? null,
      country: vendor?.country ?? null,
      postalCode: vendor?.postalCode ?? null,
      gstin: vendor?.gstin ?? null,
      pan: vendor?.pan ?? null,
      accountHolderName: vendor?.accountHolderName ?? null,
      bankAccountNumber: vendor?.bankAccountNumber ?? null,
      ifscCode: vendor?.ifscCode ?? null
    };
  }


  // toggle edit mode only if vendor is approved
  toggleEditMode(): void {
    if (!this.isApprovedVendor) {
      return;
    }
    this.isEditMode = !this.isEditMode;
  }

  // check if the vendor is approved 
  get isApprovedVendor(): boolean {
    const approvalValue = this.authStatus ?? localStorage.getItem('vendorStatus');
    return normalizeApprovalStatus(approvalValue) === ApprovalStatus.Approved;
  }

}
