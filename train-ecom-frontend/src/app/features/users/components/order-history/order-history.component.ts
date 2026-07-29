import { Component, inject } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { OrderHistoryItem } from '../../../../core/models/order-history.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent {
  private orderHistoryService = inject(OrderHistoryService);
  private notification = inject(NotificationService);

  orderHistory: OrderHistoryItem[] = [];

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  private loadOrderHistory(): void {
    this.orderHistoryService.getAllOrderHistory().subscribe({
      next: (response) => {
        this.orderHistory = response.items;
      }, error: (error) => {
        this.notification.showError('Failed to fetch order history. Please try again later.');
      }
    });
  }

}
