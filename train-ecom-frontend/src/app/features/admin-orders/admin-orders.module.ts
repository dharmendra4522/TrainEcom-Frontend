import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminOrdersRoutingModule } from './admin-orders-routing.module';
import { OrderManagementComponent } from './components/order-management/order-management.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    OrderManagementComponent,
  ],
  imports: [
    CommonModule,
    AdminOrdersRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class AdminOrdersModule { }
