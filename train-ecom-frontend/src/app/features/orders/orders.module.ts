import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { OrdersRoutingModule } from './orders-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { OrderManagementComponent } from './components/order-management/order-management.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { FormsModule } from '@angular/forms';
import { OrderTrackingDialogComponent } from './components/order-tracking-dialog/order-tracking-dialog.component';
import { AdminOrderStatusDialogComponent } from './components/admin-order-status-dialog/admin-order-status-dialog.component';
@NgModule({
  declarations: [
    OrderManagementComponent,
    OrderHistoryComponent,
    OrderDetailsComponent,
    OrderTrackingDialogComponent,
    AdminOrderStatusDialogComponent,
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class OrdersModule { }
