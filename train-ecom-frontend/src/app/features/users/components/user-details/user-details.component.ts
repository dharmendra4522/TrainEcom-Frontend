import { Component, inject } from '@angular/core';
import { VendorService } from '../../../../core/services/vendor.service';
import { ActivatedRoute } from '@angular/router';
import { DocumentType, VendorDetails, VendorDocument, VendorStatus } from '../../../../core/models/vendor.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ApprovalStatus } from '../../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { approvalStatusToLabel } from '../../../../core/utils/role.utils';
import { Location } from '@angular/common';
import { VendorActionDialogComponent } from '../../../../shared/components/vendor-action-dialog/vendor-action-dialog.component';
import { AdminUser } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { Role } from '../../../../core/models/auth.model';

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
  private userService = inject(UserService);

  private vendorId: number = 0;
  vendorDetails: VendorDetails | null = null;
  customerDetails: AdminUser | null = null;
  isCustomer: boolean = false;
  isVendor: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchVendorId();
    if (this.vendorId) {
      this.route.queryParamMap.subscribe(params => {
        const role = Number(params.get('role'));
        this.isCustomer = role === Role.Customer;
        this.isVendor = role === Role.Vendor || !role;

        if (this.isCustomer) {
          this.loadCustomerDetail();
        } else {
          this.loadVendorDetail();
        }
      });
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
      next: (response: VendorDetails) => {
        if (response && response.documents) {
          response.documents = response.documents.map((doc: VendorDocument) => ({
            ...doc,
            documentLabel: this.getDocumentLabel(doc.documentType)
          }));
        }
        this.vendorDetails = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.notificationService.showError(
          'Failed to load vendor details',
          String(err)
        );
        this.isLoading = false;
      },
    });
  }

  private loadCustomerDetail(): void {
    if (!this.vendorId) return;
    this.isLoading = true;
    this.userService
      .getAllUsers({
        role: Role.Customer,
        pageNumber: 1,
        pageSize: 1000
      })
      .subscribe({
        next: (response) => {
          this.customerDetails =
            response.items.find(user => Number(user.userId) === this.vendorId) || null;
          if (!this.customerDetails) {
            this.notificationService.showError('Customer details not found.');
          }
          this.isLoading = false;
        },
        error: () => {
          this.notificationService.showError('Failed to load customer details.');
          this.isLoading = false;
        },
      });
  }

  get customerStatusDisplay(): string {
    return this.customerDetails?.isBlocked ? 'Blocked' : 'Active';
  }

  getDocumentUrl(
    document: string | { documentUrl?: string } | null | undefined,
  ): string | null {
    const documentUrl =
      typeof document === 'string' ? document : document?.documentUrl;
    return documentUrl?.trim() || null;
  }

  // handle approve action
  public onApprove(): void {
    const vendorName = this.vendorDetails?.vendorName;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to approve ${vendorName}?`,
        yesLabel: 'Approve',
        noLabel: 'Cancel'
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      const payload = { status: ApprovalStatus.Approved, rejectionReason: '' };
      this.vendorService.updateVendorStatus(this.vendorId, payload).subscribe({
        next: () => {
          this.notificationService.showSuccess('Vendor profile create request is approved', 'close');
          this.loadVendorDetail();
        },

        error: () => {
          this.notificationService.showError('faild to update vendor profile update request', 'close');
        }
      })
    })
  }

  // handle reject action
  public onReject(): void {
    const vendorName = this.vendorDetails?.vendorName;
    const dialogRef = this.dialog.open(VendorActionDialogComponent, {
      width: '500px',
      data: {
        vendorName: vendorName,
        actionType: 'reject'
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (!result?.confirmed) {
        return;
      }
      const payload = {
        status: ApprovalStatus.Rejected,
        rejectionReason: result.message
      }
      this.vendorService.updateVendorStatus(this.vendorId, payload).subscribe({
        next: () => {
          this.notificationService.showSuccess('Vendor profile create request is reject', 'close');
          this.loadVendorDetail();
        }, error: () => {
          this.notificationService.showError('faild to update vendor profile update request', 'close');
        }
      })
    })
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

  //documnts type
  getDocumentLabel(type: number): string {
    switch (type) {
      case DocumentType.Logo:
        return 'Business Logo';
      case DocumentType.BussinessDocument:
        return 'Business Document';
      case DocumentType.GSTDocument:
        return 'GST Document';
      default:
        return 'Document';
    }
  }
}
