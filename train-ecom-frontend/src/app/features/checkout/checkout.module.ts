import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutRoutingModule } from './checkout-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CheckoutSuccessComponent } from './components/checkout-success/checkout-success.component';
import { CheckoutAddressComponent } from './components/checkout-address/checkout-address.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { CheckoutSubtotalComponent } from './components/checkout-subtotal/checkout-subtotal.component';

@NgModule({
  declarations: [
    CheckoutComponent,
    CheckoutSuccessComponent,
    CheckoutAddressComponent,
    CheckoutPaymentComponent,
    CheckoutSubtotalComponent
  ],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class CheckoutModule { }
