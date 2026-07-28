import { Component, inject } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaymentMethod } from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);

  isSubmitting: boolean = false;
  selectedAddressId: string | null = null;
  grandTotal: number = 0;
  shippingCost: number = 0;
  subtotal: number = 0;
  checkoutItems: any[] = [];
  addresses: any[] = [];


  submitOrder(): void { 
    
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
  }

  onPlaceOrder(): void {

  }

  openAddNewAddressDialog(): void {
    console.log('Open Add New Address Dialog');
  }

  selectPaymentMethod(method: string): void {

  }


  goBack(): void {
    window.history.back();
  }
}
