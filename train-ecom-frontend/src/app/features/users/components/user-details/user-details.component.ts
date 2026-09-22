import { Component, inject } from '@angular/core';
import { VendorService } from '../../../../core/services/vendor.service';
import { ActivatedRoute } from '@angular/router';
import { VendorDetails } from '../../../../core/models/vendor.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ApprovalStatus } from '../../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent {
  private vendorService = inject(VendorService);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  private vendorId: string = '';
  vendorDetails: VendorDetails | null = null;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchVendorId();
    if (this.vendorId) {
      this.loadVendorDetail();
    }
  }

  private fetchVendorId(): string {
    this.route.paramMap.subscribe((params) => {
      this.vendorId = params.get('id') || '';
    });
    return this.vendorId;
  }

  private loadVendorDetail(): void {
    this.isLoading = true;
    this.vendorService.getVendorById(this.vendorId).subscribe({
      next: (response) => {
        this.vendorDetails = response;

        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.showError('Faild to load vendor details', err);
        this.isLoading = false;
      },
    });
  }

  transformId(id: string): string {
    return id.substring(0, 6).concat('...');
  }

  private updateStatus(status: ApprovalStatus): void {
    if (!this.vendorId && !this.vendorDetails) {
      return;
    }
    const isApprove = status === ApprovalStatus.Approved;
    const vendorName = this.vendorDetails?.vendorName;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure want to ${isApprove ? 'approve' : 'reject'} ${vendorName}`,
        yesLabel: isApprove ? 'Approve' : 'Reject',
        noLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const payload = {
          status: status,
          rejectionReason: isApprove ? '' : 'Rejected By Admin',
        };

        this.vendorService
          .updateVendorStatus(this.vendorId, payload)
          .subscribe({
            next: (response) => {
              this.notificationService.showSuccess(
                response.message ||
                  `vendor ${isApprove ? 'approve' : 'reject'} successfully`,
              );
              this.loadVendorDetail();
            },
            error: (err) => {
              this.notificationService.showError(
                err || 'faild to update vendor status',
              );
            },
          });
      }
    });
  }

  onApprove(): void{
    this.updateStatus(ApprovalStatus.Approved);
  }
  onReject(): void{
    this.updateStatus(ApprovalStatus.Rejected);
  }

  get isApproveDisabled(): boolean{
    return this.vendorDetails?.status?.toLowerCase() === 'rejected';
  }
}
