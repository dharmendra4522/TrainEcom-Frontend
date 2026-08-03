import { Component, Inject, inject, OnInit } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderTrackingResponse } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-tracking-dialog',
  templateUrl: './order-tracking-dialog.component.html',
  styleUrl: './order-tracking-dialog.component.css'
})
export class OrderTrackingDialogComponent implements OnInit {
  private orderHistoryService = inject(OrderHistoryService);
  private dialogRef = inject(MatDialogRef<OrderTrackingDialogComponent>);

  trackingData: OrderTrackingResponse | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { orderId: string }) { }

  ngOnInit(): void {
    this.fetchTrackingDetails();
  }

  private fetchTrackingDetails(): void {
    this.isLoading = true;
    this.orderHistoryService.getOrderTracking(this.data.orderId).subscribe({
      next: (response) => {
        if (response && response.trackingSteps) {


          const isCancelled = response.trackingSteps.some(step => step.status.toLowerCase() === 'cancelled' && (step.completed || response.currentStatus.toLowerCase() === 'cancelled'));
          if (isCancelled) {
            response.trackingSteps = response.trackingSteps.filter(
              step => {
                const statusLower = step.status.toLowerCase();
                return statusLower === 'cancelled' || step.completed || statusLower === 'pending' || statusLower === 'confirmed';
              });
            response.trackingSteps = response.trackingSteps.map(step => {
              if (step.status.toLowerCase() !== 'cancelled') {
                step.completed = true;
              }
              return step;
            });
          }
        }
        this.trackingData = response;
        this.isLoading = false;

      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch tracking details. Please try again later.';
        this.isLoading = false;
      }
    })
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
