import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './components/profile/profile.component';
import { AddressComponent } from './components/address/address.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { customerGuard } from '../../core/guards/customer.guard';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { managementAccessGuard } from '../../core/guards/management-access.guard';

const managementRouteData = {
  feature: 'users.manage',
  pageMode: 'management'
}

const routes: Routes = [
  // Profile route accessible by both Customer (/account/profile) and Admin (/admin/profile)
  { path: 'profile', canActivate: [authGuard], component: ProfileComponent },
  {
    path: 'address',
    canActivate: [customerGuard],
    component: AddressComponent
  },
  {
    path: 'wishlist',
    canActivate: [customerGuard],
    component: WishlistComponent
  },

  // Admin/vendor User Management routes (/admin/users/manage)
  {
    path: 'manage',
    canActivate: [authGuard, managementAccessGuard],
    component: UserManagementComponent,
    data: managementRouteData
  },

  // user details page
  {
    path: 'manage/:id',
    canActivate: [authGuard, managementAccessGuard],
    component: UserDetailsComponent,
    data: managementRouteData
  },

  // Default empty route when lazy loaded at /admin/profile
  { path: '', canActivate: [authGuard], component: ProfileComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule { }
