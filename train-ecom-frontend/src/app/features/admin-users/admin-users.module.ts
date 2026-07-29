import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminUsersRoutingModule } from './admin-users-routing.module';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    UserManagementComponent,
  ],
  imports: [
    CommonModule,
    AdminUsersRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class AdminUsersModule { }
