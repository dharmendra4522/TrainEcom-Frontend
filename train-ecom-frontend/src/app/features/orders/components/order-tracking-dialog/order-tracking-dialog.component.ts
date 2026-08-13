import { Component, Inject, inject, OnInit } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderTrackingResponse, OrderTrackingStep } from '../../../../core/models/order.model';
import { HttpErrorResponse } from '@angular/common/http';

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

  // fetch tracking details for the given orderId
  private fetchTrackingDetails(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.orderHistoryService.getOrderTracking(this.data.orderId).subscribe({
      next: (response: OrderTrackingResponse) => {
        if (response && response.trackingSteps) {
          this.processTrackingSteps(response);
        }
        this.trackingData = response;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleTrackingError(error);
      }
    });
  }


  // Processes and sanitizes tracking steps (date appending & cancellation rules).
  private processTrackingSteps(response: OrderTrackingResponse): void {
    response.trackingSteps = this.formatStepDates(response.trackingSteps);

    if (this.isOrderCancelled(response)) {
      response.trackingSteps = this.filterAndCompleteCancelledSteps(response.trackingSteps);
    }
  }

  // Appends 'Z' to date strings if missing time zone indicators.
  private formatStepDates(steps: OrderTrackingStep[]): OrderTrackingStep[] {
    return steps.map((step: OrderTrackingStep) => {
      if (step.statusDate && !step.statusDate.endsWith('Z') && !step.statusDate.includes('+')) {
        return { ...step, statusDate: step.statusDate + 'Z' };
      }
      return step;
    });
  }

  // Checks if the order tracking state indicates a cancellation.
  private isOrderCancelled(response: OrderTrackingResponse): boolean {
    return response.trackingSteps.some(
      (step: OrderTrackingStep) =>
        step.status.toLowerCase() === 'cancelled' &&
        (step.completed || response.currentStatus.toLowerCase() === 'cancelled')
    );
  }


  // Filters out irrelevant steps and marks non-cancelled steps as completed for cancelled orders.
  private filterAndCompleteCancelledSteps(steps: OrderTrackingStep[]): OrderTrackingStep[] {
    const filteredSteps = steps.filter((step: OrderTrackingStep) => {
      const statusLower = step.status.toLowerCase();
      return statusLower === 'cancelled' || step.completed || statusLower === 'pending' || statusLower === 'confirmed';
    });

    return filteredSteps.map((step: OrderTrackingStep) => {
      if (step.status.toLowerCase() !== 'cancelled') {
        return { ...step, completed: true };
      }
      return step;
    });
  }


  // Handles errors during the tracking details fetch operation.
  private handleTrackingError(error: HttpErrorResponse): void {
    this.errorMessage = 'Failed to fetch tracking details. Please try again later.';
    this.isLoading = false;
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}