import { Component, inject } from '@angular/core';
import { VendorService } from '../../../../core/services/vendor.service';
import { ActivatedRoute } from '@angular/router';
import { VendorDetails } from '../../../../core/models/vendor.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ApprovalStatus } from '../../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { approvalStatusToLabel } from '../../../../core/utils/role.utils';
import { Location } from '@angular/common';

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
  private location = inject(Location);

  private vendorId: number = 0;
  vendorDetails: VendorDetails | null = null;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchVendorId();
    if (this.vendorId) {
      this.loadVendorDetail();
    }
  }

  private fetchVendorId(): number {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.vendorId = idParam ? Number(idParam) : 0;
    });
    return this.vendorId;
  }

  private loadVendorDetail(): void {
    if (!this.vendorId) return;
    this.isLoading = true;
    this.vendorService.getVendorById(this.vendorId).subscribe({
      next: (response) => {
        this.vendorDetails = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.showError(
          'Failed to load vendor details',
          String(err),
        );
        this.isLoading = false;
      },
    });
  }

  transformId(id: number | string): string {
    return String(id).substring(0, 6).concat('...');
  }

  getDocumentUrl(
    document: string | { documentUrl?: string } | null | undefined,
  ): string | null {
    const documentUrl =
      typeof document === 'string' ? document : document?.documentUrl;
    return documentUrl?.trim() || null;
  }

  private updateStatus(status: ApprovalStatus): void {
    if (!this.vendorId && !this.vendorDetails) {
      return;
    }
    const isApprove = status === ApprovalStatus.Approved;
    const vendorName =
      this.vendorDetails?.vendorName || this.vendorDetails?.bussinessName;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure want to ${isApprove ? 'approve' : 'reject'} ${vendorName}?`,
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
                  `Vendor ${isApprove ? 'approved' : 'rejected'} successfully`,
              );
              this.loadVendorDetail();
            },
            error: (err) => {
              this.notificationService.showError(
                String(err) || 'Failed to update vendor status',
              );
            },
          });
      }
    });
  }

  onApprove(): void {
    this.updateStatus(ApprovalStatus.Approved);
  }
  onReject(): void {
    this.updateStatus(ApprovalStatus.Rejected);
  }

  get vendorStatusDisplay(): string {
    return approvalStatusToLabel(this.vendorDetails?.status);
  }

  get isApproveDisabled(): boolean {
    const currentStatus = Number(this.vendorDetails?.status);
    return (
      currentStatus === ApprovalStatus.Approved ||
      currentStatus === ApprovalStatus.Rejected
    );
  }

  onBack(): void {
    this.location.back();
  }
}
