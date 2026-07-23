import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { AddressComponent } from './components/address/address.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProfileComponent } from './components/profile/profile.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { CartComponent } from './cart/cart.component';


@NgModule({
  declarations: [
    AddressComponent,
    ProfileComponent,
    WishlistComponent,
    CartComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class UsersModule { }
