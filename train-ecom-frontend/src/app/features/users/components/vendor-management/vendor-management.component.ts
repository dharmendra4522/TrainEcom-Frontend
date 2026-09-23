import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  ApprovalStatus,
  approvalStatusToLabel,
  normalizeApprovalStatus,
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

@Component({
  selector: 'app-vendor-management',
  templateUrl: './vendor-management.component.html',
  styleUrl: './vendor-management.component.css',
})
export class VendorManagementComponent implements OnInit, OnDestroy {
  private vendorService = inject(VendorService);
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

  // update vendor status
  private updateVendorStatus(
    vendorId: number,
    status: ApprovalStatus,
    vendorName: string,
  ): void {
    const isApproving = status === ApprovalStatus.Approved;

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
          status: status,
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

  private searchStream(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadVendors();
      });
  }

  // load vendor details for table
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
        this.vendors = res.items.map(
          (vendor: VendorItem): VendorTableItem => ({
            ...vendor,
            id: Number(vendor.vendorId),
            name: vendor.name || vendor.bussinessName || 'N/A',
            categoriesDisplay: Array.isArray(vendor.categories)
              ? vendor.categories.join(', ')
              : 'N/A',
            statusDisplay: approvalStatusToLabel(vendor.status),
            vendorStatusClass: this.getStatusBadgeClass(vendor.status),
          }),
        );
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
    const vendor = event.row as VendorDetails;
    if (!vendor) {
      return;
    }

    const vendorId = Number(vendor.vendorId);
    const currentApprovalStatus = normalizeApprovalStatus(vendor.status);
    const isAlreadyRejected = currentApprovalStatus === ApprovalStatus.Rejected;
    const isAlreadyApproved = currentApprovalStatus === ApprovalStatus.Approved;
    const vendorName = vendor.bussinessName || vendor.vendorName || 'Vendor';

    if (event.action === 'edit') {
      console.log('Edit vendor', vendorId);
    } else if (event.action === 'delete') {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Are you sure you want to delete ${vendorName}?`,
          vendorId: vendorId,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.notificationService.showSuccess('Vendor Deleted Successfully');
        }
      });
    } else if (event.action === 'verifyApprove') {
      // 🛠️ Agar vendor already rejected ya approved hai toh dialog open nahi hoga, sirf warning aayegi
      if (isAlreadyRejected) {
        this.notificationService.showWarning(
          'Rejected vendor status cannot be changed.',
        );
        return;
      }
      if (isAlreadyApproved) {
        this.notificationService.showWarning(
          'This vendor is already approved.',
        );
        return;
      }
      this.updateVendorStatus(
        vendorId,
        ApprovalStatus.Approved,
        vendorName,
      );
    } else if (
      event.action === 'verifyPending' ||
      event.action === 'verifyReject'
    ) {
      // 🛠️ Rejected vendor ke liye reject action par bhi warning show karega
      if (isAlreadyRejected) {
        this.notificationService.showWarning(
          'Vendor is already rejected.',
        );
        return;
      }
      if (isAlreadyApproved) {
        this.notificationService.showWarning(
          'Approved vendor cannot be rejected directly.',
        );
        return;
      }
      this.updateVendorStatus(
        vendorId,
        ApprovalStatus.Rejected,
        vendorName,
      );
    }
  }

  onRowClick(row: VendorTableItem | Record<string, unknown>): void {
    const vendor = row as VendorItem;
    if (vendor && vendor.vendorId) {
      this.router.navigate(['/admin/users/manage', vendor.vendorId]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
