import { Component, EventEmitter, Input, Output, output } from '@angular/core';
import { CheckoutItem } from '../../../../core/models/checkout.model';

@Component({
  selector: 'app-checkout-subtotal',
  templateUrl: './checkout-subtotal.component.html',
  styleUrl: './checkout-subtotal.component.css'
})
export class CheckoutSubtotalComponent {

  // items list and totals from parent component
  @Input() items: CheckoutItem[] = [];
  @Input() subtotal: number = 0;
  @Input() shippingCost: number = 0;
  @Input() grandTotal: number = 0;
  @Input() isSubmitting: boolean = false;

  // send remove and place order emitter to parent
  @Output() removeItem = new EventEmitter<CheckoutItem>();
  @Output() placeOrder = new EventEmitter<void>();


  onRemove(item: CheckoutItem): void {
    this.removeItem.emit(item);
  }

  onPlaceOrder(): void {
    this.placeOrder.emit();
  }

}
