import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsumerRoutingModule } from './consumer-routing.module';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../../shared/shared.module';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AddressComponent } from './address/address.component';


@NgModule({
  declarations: [
    HomeComponent,
    ProfileComponent,
    AddressComponent,
  ],
  imports: [
    CommonModule,
    ConsumerRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class ConsumerModule { }
