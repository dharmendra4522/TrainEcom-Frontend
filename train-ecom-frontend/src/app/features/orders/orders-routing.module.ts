import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';
import { customerGuard } from '../../core/guards/customer.guard';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderManagementComponent } from './components/order-management/order-management.component';

const routes: Routes = [
  { path: 'history', canActivate: [customerGuard], component: OrderHistoryComponent },
  { path: 'manage', canActivate: [authGuard, adminGuard], component: OrderManagementComponent },
  { path: '', redirectTo: 'history', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
