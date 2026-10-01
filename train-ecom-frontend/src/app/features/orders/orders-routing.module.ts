import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { customerGuard } from '../../core/guards/customer.guard';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderManagementComponent } from './components/order-management/order-management.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { managementAccessGuard } from '../../core/guards/management-access.guard';

const managementRouteData = {
  feature: 'orders.manage',
  pageMode: 'management',
};

const routes: Routes = [
  {
    path: 'manage',
    canActivate: [authGuard, managementAccessGuard],
    component: OrderManagementComponent,
    data: managementRouteData,
  },
  { path: 'history', canActivate: [customerGuard], component: OrderHistoryComponent },

  {
    path: 'details/:orderId',
    canActivate: [authGuard, managementAccessGuard],
    component: OrderDetailsComponent,
    data: managementRouteData,
  },
  {
    path: 'customer-details/:orderId',
    canActivate: [customerGuard],
    component: OrderDetailsComponent,
    data: { pageMode: 'customer' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
