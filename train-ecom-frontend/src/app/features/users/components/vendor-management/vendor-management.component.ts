import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  ApprovalStatus,
} from '../../../../core/models/user.model';
import { PageEvent } from '@angular/material/paginator';
import {
  TableAction,
  TableActionEvent,
  TableColumn,
} from '../../../../core/models/table.model';
import { VendorService } from '../../../../core/services/vendor.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  VendorDetails,
  VendorItem,
  VendorTableItem,
} from '../../../../core/models/vendor.model';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { approvalStatusToLabel, normalizeApprovalStatus } from '../../../../core/utils/role.utils';

@Component({
  selector: 'app-vendor-management',
  templateUrl: './vendor-management.component.html',
  styleUrl: './vendor-management.component.css',
})
export class VendorManagementComponent implements OnInit, OnDestroy {
  private vendorService = inject(VendorService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private router = inject(Router);

  isLoading: boolean = false;
  statusOptions: Array<{ label: string; value: ApprovalStatus | 'All' }> = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending', value: ApprovalStatus.Pending },
    { label: 'Approved', value: ApprovalStatus.Approved },
    { label: 'Rejected', value: ApprovalStatus.Rejected },
  ];

  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  vendors: VendorTableItem[] = [];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl<ApprovalStatus | 'All'>('All'),
  });

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', truncate: false },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'bussinessName', label: 'Business Name', truncate: false },
    { key: 'categoriesDisplay', label: 'Categories', truncate: false },
    {
      key: 'statusDisplay',
      label: 'Status',
      type: 'badge',
      badgeClassKey: 'vendorStatusClass',
    },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      tooltip: 'Edit Vendor',
    },
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete Vendor',
    },
    {
      actionKey: 'verifyApprove',
      icon: 'check_circle',
      color: 'primary',
      tooltip: 'Approve Vendor',
    },
    {
      actionKey: 'verifyPending',
      icon: 'cancel',
      color: 'warn',
      tooltip: 'Reject Vendor',
    },
  ];

  ngOnInit() {
    this.searchStream();
    this.loadVendors();
  }

  private searchStream(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadVendors();
      });
  }

  loadVendors(): void {
    this.isLoading = true;
    const filter = {
      search: this.searchQuery || undefined,
      status:
        this.selectedStatus === 'All'
          ? undefined
          : (this.selectedStatus as ApprovalStatus),
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
    };

    this.vendorService.getVendors(filter).subscribe({
      next: (res) => {
        this.vendors = res.items.map((vendor: VendorItem): VendorTableItem => {
          const bName =
            vendor.bussinessDetail?.bussinessName ||
            vendor.bussinessName ||
            'N/A';
          const categories =
            vendor.bussinessDetail?.bussinessCategories || vendor.categories;
          const status =
            normalizeApprovalStatus(vendor.approvalStatus ?? vendor.status) ??
            ApprovalStatus.Pending;

          return {
            ...vendor,
            id: Number(vendor.userId || vendor.vendorId),
            name: vendor.name || bName || 'N/A',
            categoriesDisplay:
              Array.isArray(categories) && categories.length > 0
                ? categories.join(', ')
                : 'N/A',
            statusDisplay: approvalStatusToLabel(status),
            vendorStatusClass: this.getStatusBadgeClass(status),
          };
        });
        this.totalRecords = res.totalRecords;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.showError('Error fetching vendor list');
        this.isLoading = false;
      },
    });
  }

  private getStatusBadgeClass(
    status: string | number | ApprovalStatus,
  ): string {
    const numStatus = Number(status);
    switch (numStatus) {
      case ApprovalStatus.Approved:
        return 'bg-success-subtle text-success border border-success-subtle';
      case ApprovalStatus.Pending:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case ApprovalStatus.Rejected:
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVendors();
  }

  resetFilter(): void {
    this.filterForm.setValue(
      { search: '', status: 'All' },
      { emitEvent: false },
    );
    this.pageIndex = 0;
    this.loadVendors();
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }
  get selectedStatus(): ApprovalStatus | 'All' {
    return this.filterForm.get('status')?.value || 'All';
  }

  onActionClick(event: TableActionEvent): void {
    const vendor = event.row as VendorTableItem;
    if (!vendor) return;

    const vendorId = Number(vendor.userId || vendor.vendorId || vendor.id);
    const vendorName = (vendor.bussinessDetail?.bussinessName ||
      vendor.bussinessName ||
      vendor.name ||
      'Vendor') as string;
    const currentStatus =
      normalizeApprovalStatus(vendor.approvalStatus ?? vendor.status) ??
      ApprovalStatus.Pending;

    switch (event.action) {
      case 'edit':
        this.handleEditVendor(vendorId);
        break;
      case 'delete':
        this.handleDeleteVendor(vendorId, vendorName);
        break;
      case 'verifyApprove':
        this.handleStatusUpdate(
          vendorId,
          vendorName,
          ApprovalStatus.Approved,
          currentStatus,
        );
        break;
      case 'verifyPending':
      case 'verifyReject':
        this.handleStatusUpdate(
          vendorId,
          vendorName,
          ApprovalStatus.Rejected,
          currentStatus,
        );
        break;
    }
  }

  private handleEditVendor(vendorId: number): void {
    console.log('Edit vendor', vendorId);
  }

  private handleDeleteVendor(vendorId: number, vendorName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Kya aap sach mein ${vendorName} ko delete karna chahte hain?`,
        yesLabel: 'Delete',
        noLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(vendorId).subscribe({
          next: (res: any) => {
            this.notificationService.showSuccess(
              res?.message || 'Vendor Deleted Successfully',
            );
            this.loadVendors();
          },
          error: (err) => {
            this.notificationService.showError(
              err?.error?.message || 'Vendor Delete Failed',
            );
          },
        });
      }
    });
  }

  private handleStatusUpdate(
    vendorId: number,
    vendorName: string,
    targetStatus: ApprovalStatus,
    currentStatus: ApprovalStatus,
  ): void {
    const isApproving = targetStatus === ApprovalStatus.Approved;

    // Validation checks
    if (currentStatus === ApprovalStatus.Rejected) {
      this.notificationService.showWarning(
        'Rejected vendor status cannot be changed.',
      );
      return;
    }
    if (isApproving && currentStatus === ApprovalStatus.Approved) {
      this.notificationService.showWarning('This vendor is already approved.');
      return;
    }
    if (!isApproving && currentStatus === ApprovalStatus.Approved) {
      this.notificationService.showWarning(
        'Approved vendor cannot be rejected directly.',
      );
      return;
    }

    // Confirmation Dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to ${isApproving ? 'approve' : 'reject'} ${vendorName}?`,
        yesLabel: isApproving ? 'Approve' : 'Reject',
        noLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const payload = {
          status: targetStatus,
          rejectionReason: isApproving ? '' : 'Rejected by Admin',
        };
        this.vendorService.updateVendorStatus(vendorId, payload).subscribe({
          next: (response) => {
            this.notificationService.showSuccess(
              response.message ||
                `Vendor ${isApproving ? 'approved' : 'rejected'} successfully`,
            );
            this.loadVendors();
          },
          error: (err) => {
            this.notificationService.showError('Vendor Status Update Failed');
            console.error('Vendor Status Update Failed', err);
          },
        });
      }
    });
  }

  onRowClick(row: VendorTableItem | Record<string, unknown>): void {
    const vendor = row as VendorTableItem;
    const vendorId = vendor?.userId || vendor?.vendorId || vendor?.id;
    if (vendor && vendorId) {
      this.router.navigate(['/admin/users/manage', vendorId]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
