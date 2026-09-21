import { Component, inject } from '@angular/core';
import { ApprovalStatus } from '../../../../core/models/user.model';
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
export class VendorManagementComponent {
  private vendorService = inject(VendorService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private router = inject(Router);

  isLoading: boolean = false;
  statusOptions: string[] = ['Pending', 'Approved', 'Rejected'];

  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  vendors: VendorTableItem[] = [];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl('All'),
  });

  columns: TableColumn[] = [
    { key: 'bussinessName', label: 'Name', truncate: false },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'city', label: 'city' },
    {
      key: 'statusDisplay',
      label: 'Status',
      type: 'badge',
      badgeClassKey: 'vendorStatusClass',
    },
  ];

  actions: TableAction[] = [
    // {
    //   actionKey: 'edit',
    //   icon: 'edit',
    //   color: 'primary',
    //   tooltip: 'Edit Vendor',
    // },
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

  private updateVendorStatus(
    vendorId: string,
    status: ApprovalStatus,
    vendorName: string,
  ): void {
    const isApproving = status === ApprovalStatus.Approved;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to ${isApproving ? 'approve' : 'reject'} ${vendorName}`,
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
                `Vendor ${isApproving ? 'approved' : 'reject'} successfully`,
            );
            this.loadVendors();
          },
          error: (err) => {
            this.notificationService.showError('Vendor Status Update Faild');
            console.log('Vendor Status Update Faild', err);
          },
        });
      }
    });
  }

  // handle search query
  private searchStream(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadVendors();
      });
  }

  // load list of vendors
  loadVendors(): void {
    this.isLoading = true;
    const filter = {
      search: this.searchQuery || undefined,
      status: this.selectedStatus === 'All' ? undefined : this.selectedStatus,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
    };

    this.vendorService.getVendors(filter).subscribe({
      next: (res) => {
        this.vendors = res.items.map(
          (vendor: VendorItem): VendorTableItem => ({
            ...vendor,
            id: vendor.vendorId,
            statusDisplay: vendor.status,
            vendorStatusClass: this.getStatusBadgeClass(vendor.status),
          }),
        );
        this.totalRecords = res.totalRecords;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.showError('Error to fetch vendor list');
        this.isLoading = false;
      },
    });
  }

  private getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'Pending':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'Rejected':
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

  // handle reset filters
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
  get selectedStatus(): string {
    return this.filterForm.get('status')?.value || '';
  }

  // method for handle actions
  onActionClick(event: TableActionEvent): void {
    const vendor = event.row as VendorTableItem;
    if (!vendor) {
      return;
    }

    if (event.action === 'edit') {
      console.log('Edit vendor', vendor.vendorId);
    } else if (event.action === 'delete') {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Are you sure you want to delete ${vendor.bussinessName}?`,
          vendorId: vendor.vendorId,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.notificationService.showSuccess('Vendor Deleted Successfully');
          console.log('Delete vendor', vendor.vendorId);
        }
      });
    } else if (event.action === 'verifyApprove') {
      this.updateVendorStatus(
        vendor.vendorId,
        ApprovalStatus.Approved,
        vendor.bussinessName,
      );
    } else if (
      event.action === 'verifyPending' ||
      event.action === 'verifyReject'
    ) {
      this.updateVendorStatus(
        vendor.vendorId,
        ApprovalStatus.Rejected,
        vendor.bussinessName,
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
