import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { AddressComponent } from './components/address/address.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProfileComponent } from './components/profile/profile.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { FormsModule } from '@angular/forms';
import { VendorManagementComponent } from './components/vendor-management/vendor-management.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { VendorProfileComponent } from './components/vendor-profile/vendor-profile.component';
import { AuthModule } from '../auth/auth.module';
import { RequestApprovalComponent } from './components/request-approval/request-approval.component';
import { VendorProfileEditComponent } from './components/vendor-profile-edit/vendor-profile-edit.component';
@NgModule({
  declarations: [
    AddressComponent,
    ProfileComponent,
    WishlistComponent,
    UserManagementComponent,
    VendorManagementComponent,
    AllUsersComponent,
    UserDetailsComponent,
    ProfileEditComponent,
    VendorProfileComponent,
    RequestApprovalComponent,
    VendorProfileEditComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    AuthModule
  ],
})
export class UsersModule {}
