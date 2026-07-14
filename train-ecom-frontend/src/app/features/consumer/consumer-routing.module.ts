import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from '../../core/guards/auth.guard';
import { AddressComponent } from './address/address.component';
import { customerGuard } from '../../core/guards/customer.guard';

const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent 
  },
  {
    path: 'account',
    canActivate: [customerGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },

      { path: 'profile', component: ProfileComponent },
      { path: 'address', component: AddressComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsumerRoutingModule { }
