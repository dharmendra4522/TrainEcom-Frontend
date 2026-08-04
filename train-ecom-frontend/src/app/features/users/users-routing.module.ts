import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './components/profile/profile.component';
import { AddressComponent } from './components/address/address.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { customerGuard } from '../../core/guards/customer.guard';
import { adminGuard } from '../../core/guards/admin.guard';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  // Used when the module is lazy loaded at /admin/users.
  { path: '', canActivate: [authGuard, adminGuard], component: UserManagementComponent },

  // Customer account routes, lazy loaded at /account/...
  { path: 'profile', canActivate: [authGuard, customerGuard], component: ProfileComponent },
  { path: 'address', canActivate: [customerGuard], component: AddressComponent },
  { path: 'wishlist', canActivate: [customerGuard], component: WishlistComponent },

  // Keep the existing admin URL working as an alias.
  { path: 'manage', canActivate: [authGuard, adminGuard], component: UserManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
