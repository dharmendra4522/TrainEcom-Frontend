import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  ApprovalStatus,
  normalizeApprovalStatus,
  UserProfile,
} from '../../../../core/models/user.model';
import { Store } from '@ngrx/store';
import {
  selectUserError,
  selectUserIsLoading,
  selectUserProfile,
} from '../../../../core/store/user/user.selectors';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import * as UserActions from '../../../../core/store/user/user.actions';
import { Role } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private userStore = inject(Store);

  roleEnum = Role;

  // Observables for state
  isLoading$ = this.userStore.select(selectUserIsLoading);
  error$ = this.userStore.select(selectUserError);
  userProfile$ = this.userStore.select(selectUserProfile);

  userProfile: UserProfile | null = null;
  isEditMode: boolean = false;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userProfile$.pipe(take(1)).subscribe((profile) => {
      if (!profile) {
        this.fetchUserProfile();
      }
    });
    this.subscribeToStoreData();
  }
  
  public isVendorPending(): boolean {
    const vendorStatus = localStorage.getItem('vendorStatus');
    const status = normalizeApprovalStatus(vendorStatus);
    return status === ApprovalStatus.Pending;
  }

  fetchUserProfile(): void {
    this.userStore.dispatch(UserActions.loadProfileReq());
  }

  private subscribeToStoreData(): void {
    this.userProfile$.pipe(takeUntil(this.destroy$)).subscribe((profile) => {
      this.userProfile = profile;
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onProfileUpdated(): void {
    this.isEditMode = false;
    this.fetchUserProfile();
  }

  profileBreadcrumbs = [{ label: 'Home', url: '/' }, { label: 'My Account' }];

  getFormattedCategories(categories: string[] | null | undefined): string {
    return categories && categories.length > 0 ? categories.join(', ') : '-';
  }
}
