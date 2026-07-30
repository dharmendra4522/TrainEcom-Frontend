import { Component, inject } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { OrderHistoryItem } from '../../../../core/models/order-history.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent {
  private orderHistoryService = inject(OrderHistoryService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  orderHistory: OrderHistoryItem[] = [];
  displayLimit: number = 6;
  searchQuery: string = '';


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

  showMoreOrders(): void {
    this.displayLimit = this.orderHistory.length;
  }

  get filteredOrders(): OrderHistoryItem[] {
    if (!this.searchQuery.trim()) {
      return this.orderHistory;
    }
    const query = this.searchQuery.toLowerCase();
    return this.orderHistory.filter(order =>
      (order as any).orderName?.toLowerCase().includes(query) ||
      order.orderId.toLowerCase().includes(query)
    );
  }

  getOrdertatusClass(orderStatus: string): string {
    switch (orderStatus?.toLowerCase()) {
      case 'confirmed':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'processing':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'shipped':
        return 'bg-info-subtle text-info border border-info-subtle';
      case 'delivered':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'cancelled':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'pending':
      default:
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }


  getImageUrl(url?: string | null): string {
    if (!url || url === 'null' || url.trim() === '') {
      return 'assets/images/placeholder.png';
    }
    return url;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.png';
  }

  navigateToOrderDetails(orderId: string): void {
    this.router.navigate(['/orders/details', orderId]);
  }


}
