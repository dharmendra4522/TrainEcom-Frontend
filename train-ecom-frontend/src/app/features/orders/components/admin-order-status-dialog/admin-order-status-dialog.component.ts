import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderStatus, PaymentMethod } from '../../../../core/models/order.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PortalKey } from '../../../../core/config/management-access.config';
import { normalizeOrderStatus, normalizePaymentMethod } from '../../../../core/utils/role.utils';
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
  statuses: OrderStatus[] = Object.values(OrderStatus).filter(
    (val) => typeof val === 'number'
  ) as OrderStatus[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    orderId: string;
    currentStatus: OrderStatus;
    portal: PortalKey;
  }) {
    this.form = this.fb.group({
      status: [data.currentStatus, Validators.required],
      remark: ['']
    });
  }

  // helper method to check if the selected status is different from the current status
  isStatusDisabled(status: OrderStatus | string | number): boolean {
    const statusHierarchy: OrderStatus[] = [
      OrderStatus.Pending,
      OrderStatus.Confirmed,
      OrderStatus.Processing,
      OrderStatus.Shipped,
      OrderStatus.Delivered,
      OrderStatus.Cancelled
    ];
    const numericStatus = typeof status === 'string' ? OrderStatus[status as keyof typeof OrderStatus] : status;
    
    const currentIndex = statusHierarchy.indexOf(this.data.currentStatus);
    const selectedIndex = statusHierarchy.indexOf(numericStatus as OrderStatus);

    if (this.data.currentStatus === OrderStatus.Delivered && numericStatus === OrderStatus.Cancelled) {
      return true;
    }

    return selectedIndex <= currentIndex;
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

    this.orderService.updateManagedOrderStatus(
      this.data.portal,
      this.data.orderId,
      newStatus,
      remark,
    ).subscribe({
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

  // Helper for template dropdown text
  normalizeOrderStatus(status: OrderStatus | string | number): string {
    return normalizeOrderStatus(status);
  }

}
