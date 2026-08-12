import { Component, inject } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrderDetailsResponse, OrderStatus } from '../../../../core/models/order.model';
import { BreadcrumbItem } from '../../../../core/models/table.model';
import { OrderTrackingDialogComponent } from '../order-tracking-dialog/order-tracking-dialog.component';
import { AdminOrderStatusDialogComponent } from '../admin-order-status-dialog/admin-order-status-dialog.component';
import { ReviewRatingDialogComponent } from '../../../../shared/components/review-rating-dialog/review-rating-dialog.component';
import { ReviewService } from '../../../../core/services/review.service';
import { Review } from '../../../../core/models/review.model';

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
  private router = inject(Router);
  private reviewService = inject(ReviewService);


  orderDetail: OrderDetailsResponse | null = null;
  isCancelling: boolean = false;
  isAdmin: boolean = false;

  get breadcrumbs(): BreadcrumbItem[] {
    const parentRoute = this.isAdmin
      ? { label: 'Manage Orders', url: '/admin/orders' }
      : { label: 'My Orders', url: '/account/orders/history' };

    const orderIdLabel = this.orderDetail?.orderId
      ? `Order #${this.orderDetail.orderId.slice(0, 8)}`
      : 'Order Details';

    return [
      { label: 'Home', url: '/' },
      parentRoute,
      { label: orderIdLabel }
    ];
  }

  ngOnInit(): void {
    this.setRouteContext();
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.loadOrderDetails(orderId);
    }
  }

  // check routes for admin or customer
  private setRouteContext(): void {
    // Snapshot ensures isAdmin is set before deciding which endpoint to call.
    this.isAdmin = !!this.route.snapshot.data['isAdmin'];
  }

  private loadOrderDetails(orderId: string): void {
    const orderObservable = this.isAdmin ? this.orderService.getAdminOrderDetails(orderId) : this.orderService.getOrderDetails(orderId);
    orderObservable.subscribe({
      next: (response) => {
        if (response && response.orderDate && !response.orderDate.includes('+')) {
          response.orderDate = response.orderDate + 'Z';
        }
        if (response && response.payment && response.payment.paidAt && !response.payment.paidAt.includes('+')) {
          response.payment.paidAt = response.payment.paidAt + 'Z';
        }
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


  goBack(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/orders']);
    } else {
      this.router.navigate(['/account/orders/history']);
    }
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
    else {
      this.notification.showError('Order ID is not available for tracking.');
    }
  }

  openUpdateStatusDialog(): void {
    if (!this.orderDetail?.orderId) return;
    const dialogRef = this.dialog.open(AdminOrderStatusDialogComponent, {
      width: 'min(92vw, 460px)',
      maxWidth: '95vw',
      height: '500px',
      data: { orderId: this.orderDetail.orderId, currentStatus: this.orderDetail.orderStatus }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrderDetails(this.orderDetail!.orderId);
      }
    })
  }

  // Open dialog

  openReviewDialog(productId: string | number, productName: string, reviewSummary?: { reviewId: string; rating: number; review: string }): void {
    if (reviewSummary?.reviewId) {
      this.reviewService.getReviewById(reviewSummary.reviewId).subscribe({
        next: (reviewData: Review) => {
          this.showDialog(productId, productName, reviewData.rating, reviewData.review, true, reviewSummary.reviewId);
        }, error: (error) => {
          const errorMessage = error?.error?.message || 'Failed to fetch review details. Please try again.';
          this.notification.showError(errorMessage);
        }
      })
    } else {
      // Add new review
      this.showDialog(productId, productName);
    }
  }


  private showDialog(productId: string | number,
    productName: string,
    existingRating?: number,
    existingReview?: string,
    isEdit: boolean = false,
    reviewId?: string): void {
    const dialogRef = this.dialog.open(ReviewRatingDialogComponent, {
      width: '420px',
      data: { productId, productName, existingRating, existingReview, isEdit, reviewId }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleReviewSubmission(productId, result, isEdit, reviewId);
      }
    });
  }

  private handleReviewSubmission(
    productId: string | number,
    result: { rating: number; review: string },
    isEdit: boolean,
    reviewId?: string
  ): void {
    const pauload = { rating: result.rating, review: result.review };

    if (isEdit && reviewId) {
      this.reviewService.updateReview(reviewId, pauload).subscribe({
        next: (response) => {
          this.notification.showSuccess(response.Message || 'Review updated successfully');
          this.reloadDetails();
        },
        error: (error) => {
          const errMsg = error?.error?.message || 'Failed to update review.';
          this.notification.showError(errMsg);
        }
      })
    } else {
      // Add new review Api call
      this.reviewService.addReview(productId, pauload).subscribe({
        next: (response) => {
          this.notification.showSuccess(response.Message || 'Thank you, Your review saved successfully');
          this.reloadDetails();
        },
        error: (error) => {
          const errMsg = error?.error?.message || 'Failed to submit review.';
          this.notification.showError(errMsg);
        }
      })
    }
  }

  private reloadDetails(): void {
    if (this.orderDetail?.orderId) {
      this.loadOrderDetails(this.orderDetail.orderId);
    }
  }


 // 👈 reviewId ko optional ya string | number | undefined kar diya
  onDeleteReview(reviewId?: string | number): void {
    if (!reviewId) return; // Agar undefined ho toh yahin rok do

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: 'Are you sure you want to delete your review for this product?',
        yesLabel: 'Delete',
        noLabel: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        // String mein convert kar rahe hain kyunki API ko string reviewId chahiye
        this.reviewService.deleteReview(reviewId.toString()).subscribe({
          next: () => {
            this.notification.showSuccess('Review deleted successfully.');
            this.reloadDetails();
          },
          error: (error) => {
            const errMsg = error?.error?.message || 'Failed to delete review.';
            this.notification.showError(errMsg);
          }
        });
      }
    });
  }
}
