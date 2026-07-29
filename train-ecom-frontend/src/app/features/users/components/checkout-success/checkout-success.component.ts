import { Component, inject } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';


@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css',
})
export class CheckoutSuccessComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  orderId: string | null = null;
  ngOnInit(): void {
    this.loadOrderId();
  }

  private loadOrderId(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.orderId = params.get('orderId');
      if(!this.orderId){
        this.notification.showError('Unauthorized access to success page.');
        this.router.navigate(['/'], { replaceUrl: true });
      }
    });
  }

  goToHome(): void{
    this.router.navigate(['/']);
  }

}
