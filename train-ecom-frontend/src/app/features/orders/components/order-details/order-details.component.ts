import { Component, inject } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { OrderDetailsResponse } from '../../../../core/models/order-history.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrderStatus } from '../../../../core/models/order.model';
import { OrderTrackingDialogComponent } from '../order-tracking-dialog/order-tracking-dialog.component';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {
  private orderService = inject(OrderHistoryService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  orderDetail: OrderDetailsResponse | null = null;
  isCancelling: boolean = false;

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadOrderDetails(orderId);
    }
  }

  private loadOrderDetails(orderId: string): void {
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (response) => {
        this.orderDetail = response;
      },
      error: (error) => {
        this.notification.showError('Failed to fetch order details. Please try again later.');
      }
    });
  }

  getStatusClass(orderStatus: string): string {
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

  onCancelOrder(orderId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: 'Are you sure you want to cancel this order?',
        yesLabel: 'Yes',
        noLabel: 'No'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isCancelling = true;
        this.orderService.cancelOrder(orderId).subscribe({
          next: () => {
            this.isCancelling = false;
            this.notification.showSuccess('Order cancelled successfully.');
            if (this.orderDetail) {
              this.orderDetail.orderStatus = OrderStatus.Cancelled;
              this.loadOrderDetails(orderId);
            }
          },
          error: (error) => {
            this.isCancelling = false;
            this.notification.showError('Failed to cancel the order. Please try again later.');
          }
        })
      }
    })
  }

  openTrackingDialog(): void {
    const orderId = this.orderDetail?.orderId;
    if (orderId) {
      this.dialog.open(OrderTrackingDialogComponent, {
        width: '600px',
        data: { orderId }
      });
    }
    else{
      this.notification.showError('Order ID is not available for tracking.');
    }
  }

}
