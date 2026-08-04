import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentMethod } from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrl: './checkout-payment.component.css'
})
export class CheckoutPaymentComponent {

  // default/current selectd method
  @Input() selectedMethod: PaymentMethod = PaymentMethod.CashOnDelivery;

  // Method change event emitter
  @Output() methodChange = new EventEmitter<PaymentMethod>();

  PaymentMethod = PaymentMethod;

  selectMethod(method: PaymentMethod): void {
    this.methodChange.emit(method);
  }

}
