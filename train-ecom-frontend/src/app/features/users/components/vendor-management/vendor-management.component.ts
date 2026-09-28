import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
  VendorStatus,
  VendorTableItem,
} from '../../../../core/models/vendor.model';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { VendorActionDialogComponent } from '../../../../shared/components/vendor-action-dialog/vendor-action-dialog.component';

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
  statusOptions: Array<{ label: string; value: VendorStatus | 'All' }> = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: VendorStatus.Active },
    { label: 'Pending', value: VendorStatus.Pending },
    { label: 'Rejected', value: VendorStatus.Rejected },
    { label: 'Blocked', value: VendorStatus.Blocked },
  ];

  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  vendors: VendorTableItem[] = [];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl<VendorStatus | 'All'>('All'),
  });

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', truncate: false },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'bussinessName', label: 'Business Name', truncate: true },
    { key: 'categoriesDisplay', label: 'Categories', truncate: true },
    { key: 'gstinNumber', label: 'GSTIN No.', truncate: true },
    { key: 'panNumber', label: 'PAN No.', truncate: true },
    { key: 'productCount', label: 'Product Count', truncate: false },
    { key: 'storeName', label: 'Store Name', truncate: true },
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
      actionKey: 'toggleBlock',
      icon: 'block',
      color: 'warn',
      tooltip: 'Block/Unblock ',
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
      disabled: (row: unknown) => this.isVerificationDisabled(row),
    },
    {
      actionKey: 'verifyPending',
      icon: 'cancel',
      color: 'warn',
      tooltip: 'Reject Vendor',
      disabled: (row: unknown) => this.isVerificationDisabled(row),
    },
  ];

  private isVerificationDisabled(row: unknown): boolean {
    if (!this.isVendorTableItem(row)) {
      return false;
    }

    return Number(row.status) !== VendorStatus.Pending;
  }

  private isVendorTableItem(row: unknown): row is VendorTableItem {
    return typeof row === 'object' && row !== null;
  }

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
          : this.selectedStatus,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
    };

    this.vendorService.getVendors(filter).subscribe({
      next: (res) => {
        const mappedVendors = res.items.map(
          (vendor: VendorItem): VendorTableItem => {
            const bName =
              vendor.bussinessDetail?.bussinessName ||
              vendor.bussinessName ||
              'N/A';
            const categories =
              vendor.bussinessDetail?.bussinessCategories || vendor.categories;
            const currentStatus = Number(vendor.status ?? VendorStatus.Pending);

            return {
              ...vendor,
              id: Number(vendor.userId || vendor.vendorId),
              name: vendor.name || bName || 'N/A',
              categoriesDisplay:
                Array.isArray(categories) && categories.length > 0
                  ? categories.join(', ')
                  : 'N/A',
              productCount: vendor.productCount ?? 0,
              storeName: vendor.storeName || vendor.bussinessDetail?.storeName || 'N/A',
              gstinNumber: vendor.gstin || vendor.bussinessDetail?.gstin || 'N/A',
              panNumber: vendor.pan || vendor.bussinessDetail?.pan || 'N/A',
              statusDisplay: this.getVendorStatusLabel(currentStatus),
              vendorStatusClass: this.getStatusBadgeClass(currentStatus),
            };
          },
        );

        if (this.pageIndex === 0) {
          this.vendors = mappedVendors;
        } else {
          this.vendors = [...this.vendors, ...mappedVendors];
        }

        this.totalRecords = res.totalRecords;
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.showError('Error fetching vendor list');
        this.isLoading = false;
      },
    });
  }

  private getVendorStatusLabel(status: number): string {
    switch (status) {
      case VendorStatus.Active: return 'Active';
      case VendorStatus.Pending: return 'Pending';
      case VendorStatus.Rejected: return 'Rejected';
      case VendorStatus.Blocked: return 'Blocked';
      default: return 'Unknown';
    }
  }

  private getStatusBadgeClass(status: number): string {
    switch (status) {
      case VendorStatus.Active:
        return 'bg-success-subtle text-success border border-success-subtle';
      case VendorStatus.Pending:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case VendorStatus.Rejected:
      case VendorStatus.Blocked:
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }


  onTableScroll(): void {
    if (!this.isLoading && this.vendors.length < this.totalRecords) {
      this.pageIndex++;
      this.loadVendors();
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
  get selectedStatus(): VendorStatus | 'All' {
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
    const currentStatus = this.getApprovalStatus(vendor.status);

    switch (event.action) {
      case 'edit':
        this.handleEditVendor(vendorId);
        break;
      case 'toggleBlock':
        this.handleToggleBlockVendor(vendor);
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

  private getApprovalStatus(status: VendorStatus | number | undefined): ApprovalStatus {
    switch (Number(status)) {
      case VendorStatus.Active:
        return ApprovalStatus.Approved;
      case VendorStatus.Rejected:
        return ApprovalStatus.Rejected;
      case VendorStatus.Pending:
      case VendorStatus.Blocked:
      default:
        return ApprovalStatus.Pending;
    }
  }

  // handle edit vendor
  private handleEditVendor(vendorId: number): void {
    console.log('Edit vendor', vendorId);
  }

  // handle delete vendor
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
          next: (res: { message?: string }) => {
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

  // handle verify status
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

    if (isApproving) {
      // 1. Agar Approve karna ho toh simple confirm dialog khulega
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Are you sure you want to approve ${vendorName}?`,
          yesLabel: 'Approve',
          noLabel: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
        if (confirmed) {
          const payload = {
            status: targetStatus,
            rejectionReason: '',
          };
          this.vendorService.updateVendorStatus(vendorId, payload).subscribe({
            next: (response: { message?: string }) => {
              this.notificationService.showSuccess(
                response.message || 'Vendor approved successfully',
              );
              this.loadVendors();
            },
            error: (err: { error?: { message?: string } }) => {
              this.notificationService.showError(
                err?.error?.message || 'Vendor Status Update Failed',
              );
            },
          });
        }
      });
    } else {
      const dialogRef = this.dialog.open(VendorActionDialogComponent, {
        width: '450px',
        data: {
          vendorName: vendorName,
          actionType: 'reject',
        },
      });

      dialogRef
        .afterClosed()
        .subscribe(
          (result: { confirmed: boolean; message: string } | undefined) => {
            if (result && result.confirmed) {
              const payload = {
                status: targetStatus,
                rejectionReason: result.message,
              };

              this.vendorService
                .updateVendorStatus(vendorId, payload)
                .subscribe({
                  next: (response: { message?: string }) => {
                    this.notificationService.showSuccess(
                      response.message || 'Vendor rejected successfully',
                    );
                    this.loadVendors();
                  },
                  error: (err: { error?: { message?: string } }) => {
                    this.notificationService.showError(
                      err?.error?.message || 'Vendor Status Update Failed',
                    );
                  },
                });
            }
          },
        );
    }
  }

  private handleToggleBlockVendor(vendor: VendorTableItem): void {
    const vendorId = Number(vendor.userId || vendor.vendorId || vendor.id);
    const vendorName = vendor.name || 'Vendor';
    const newBlockStatus = !vendor.isBlocked;
    const actionName = newBlockStatus ? 'block' : 'unblock';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Kya aap sach mein ${vendorName} ko ${actionName} karna chahte hain?`,
        yesLabel: newBlockStatus ? 'Block' : 'Unblock',
        noLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.userService
          .updateUserStatus(vendorId, { isBlocked: newBlockStatus })
          .subscribe({
            next: () => {
              this.notificationService.showSuccess(
                `Vendor ${actionName}ed successfully.`,
              );
              this.loadVendors();
            },
            error: (err) => {
              this.notificationService.showError(
                err?.error?.message || `Failed to ${actionName} vendor.`,
              );
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
