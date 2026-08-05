import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderStatus } from '../../../../core/models/order.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-order-status-dialog',
  templateUrl: './admin-order-status-dialog.component.html',
  styleUrl: './admin-order-status-dialog.component.css'
})
export class AdminOrderStatusDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AdminOrderStatusDialogComponent>);
  private notification = inject(NotificationService);
  private orderService = inject(OrderHistoryService);


  form!: FormGroup;
  isUpdating: boolean = false;
  statuses: OrderStatus[] = Object.values(OrderStatus);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { orderId: string, currentStatus: OrderStatus }) {
    this.form = this.fb.group({
      status: [data.currentStatus, Validators.required],
      remark: ['']
    });
  }

  // helper method to check if the selected status is different from the current status
  isStatusDisabled(status: OrderStatus): boolean {
    const statusHierarchy: OrderStatus[] = [
      OrderStatus.Pending,
      OrderStatus.Confirmed,
      OrderStatus.Processing,
      OrderStatus.Shipped,
      OrderStatus.Delivered,
      OrderStatus.Cancelled
    ]
    const currentIndex = statusHierarchy.indexOf(this.data.currentStatus);
    const selectedIndex = statusHierarchy.indexOf(status);

    return selectedIndex <= currentIndex; // Disable if the selected status is earlier or same as current
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const newStatus = this.form.value.status as OrderStatus;
    const remark = (this.form.value.remark as string | null)?.trim() || undefined;
    if (newStatus === this.data.currentStatus) {
      this.notification.showInfo('Please select a different status to update.');
      return;
    }

    this.isUpdating = true;

    this.orderService.updateOrderStatus(this.data.orderId, newStatus, remark).subscribe({
      next: () => {
        this.notification.showSuccess('Order status updated successfully', 'Close');
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        const apiMessage =
          (typeof error.error === 'string' && error.error.trim()) ||
          error.error?.Message ||
          error.error?.message ||
          error.error?.title ||
          '';

        this.notification.showError(apiMessage || 'Failed to update order status. Please try again later.', 'Close');
        this.isUpdating = false;
      }
    })
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }


}
