import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CheckoutSuccessComponent } from './components/checkout-success/checkout-success.component';
import { customerGuard } from '../../core/guards/customer.guard';

const routes: Routes = [
  { path: '', canActivate: [customerGuard], component: CheckoutComponent },
  { path: 'success', canActivate: [customerGuard], component: CheckoutSuccessComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
