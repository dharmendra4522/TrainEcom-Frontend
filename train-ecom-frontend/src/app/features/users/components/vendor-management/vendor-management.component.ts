import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
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
import {
  EMPTY,
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil,
  startWith,
  switchMap,
} from 'rxjs';
import {
  VendorFilterParams,
  VendorItem,
  VendorListResponse,
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
  @Input() set externalSearchQuery(value: string) {
    if (this.filterForm.get('search')?.value !== value) {
      this.filterForm.patchValue({ search: value }, { emitEvent: true });
    }
  }
  @Output() searchReset = new EventEmitter<void>();

  private vendorService = inject(VendorService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private vendorLoadRequests$ = new Subject<void>();
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
  showHeaderFilter: boolean = true;

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl<VendorStatus | 'All'>('All'),
  });

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', truncate: false, filterable: true, filterType: 'search' },
    { key: 'phoneNumber', label: 'Phone', filterable: true, filterType: 'search' },
    { key: 'email', label: 'Email', truncate: true, filterable: true, filterType: 'search' },
    { key: 'bussinessName', label: 'Business Name', truncate: true, filterable: true, filterType: 'search' },
    { key: 'categoriesDisplay', label: 'Categories', truncate: true, filterable: true, filterType: 'dropdown' },
    { key: 'gstinNumber', label: 'GSTIN No.', truncate: true, filterable: true, filterType: 'search' },
    { key: 'panNumber', label: 'PAN No.', truncate: true, filterable: true, filterType: 'search' },
    { key: 'productCount', label: 'Product Count', truncate: false, filterable: true, filterType: 'search', filterDisabled: true },
    { key: 'storeName', label: 'Display Name', truncate: true, filterable: true, filterType: 'search' },
    {
      key: 'statusDisplay',
      label: 'Status',
      type: 'badge',
      badgeClassKey: 'vendorStatusClass',
      filterable: true, filterType: 'dropdown'
    }
  ];

  actions: TableAction[] = [
    {
      actionKey: 'edit',
      icon: 'edit',
      color: 'primary',
      disabled: true,
      tooltip: 'Edit Vendor'
    },
    {
      actionKey: 'toggleBlock',
      icon: 'block',
      color: 'warn',
      tooltip: 'Block/Unblock ',
      disabled: (row: unknown) => this.isBlockedHide(row) || this.isNonPendingDisable(row),
      hideWhenDisabled: true
    },
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      disabled: (row: unknown) => this.isNonPendingDisable(row),
      hideWhenDisabled: true,
      tooltip: 'Delete Vendor'
    },
    {
      actionKey: 'verifyApprove',
      icon: 'check_circle',
      color: 'primary',
      tooltip: 'Approve Vendor',
      disabled: (row: unknown) => this.isVerificationDisabled(row),
      hideWhenDisabled: true,
    },
    {
      actionKey: 'verifyPending',
      icon: 'cancel',
      color: 'warn',
      tooltip: 'Reject Vendor',
      disabled: (row: unknown) => this.isVerificationDisabled(row),
      hideWhenDisabled: true,
    },
  ];

  private isVerificationDisabled(row: unknown): boolean {
    if (!this.isVendorTableItem(row)) {
      return false;
    }

    return row.status !== VendorStatus.Pending;
  }

  private isBlockedHide(row: unknown): boolean {
    if (!this.isVendorTableItem(row)) {
      return false;
    }
    return row.status === VendorStatus.Rejected;
  }

  private isVendorTableItem(row: unknown): row is VendorTableItem {
    return typeof row === 'object' && row !== null;
  }

  ngOnInit() {
    this.setupVendorLoading();
    this.searchStream();
  }

  private setupVendorLoading(): void {
    this.vendorLoadRequests$
      .pipe(
        switchMap(() =>
          this.vendorService.getVendors(this.getFilterParams()).pipe(
            catchError(() => {
              this.notificationService.showError('Error fetching vendor list');
              this.isLoading = false;
              return EMPTY;
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((response: VendorListResponse) => {
        const mappedVendors = response.items.map(
          (vendor: VendorItem): VendorTableItem => {
            const businessName = vendor.businessName ?? 'N/A';
            const categories = vendor.categories ?? [];
            const currentStatus = vendor.status ?? VendorStatus.Pending;

            return {
              ...vendor,
              id: vendor.userId,
              name: vendor.name ?? businessName,
              categoriesDisplay:
                Array.isArray(categories) && categories.length > 0
                  ? categories.join(', ')
                  : 'N/A',
              productCount: vendor.productCount ?? 0,
              storeName: vendor.storeName ?? 'N/A',
              gstinNumber: vendor.gstin ?? 'N/A',
              panNumber: vendor.pan ?? 'N/A',
              statusDisplay: this.getVendorStatusLabel(currentStatus),
              vendorStatusClass: this.getStatusBadgeClass(currentStatus),
              rejectionReason: vendor.rejectionReason ?? null
            };
          },
        );

        if (this.pageIndex === 0) {
          this.vendors = mappedVendors;
        } else {
          this.vendors = [...this.vendors, ...mappedVendors];
        }

        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      });
  }

  private searchStream(): void {
    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged(
          (previous, current) =>
            previous.search === current.search &&
            previous.status === current.status
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadVendors();
      });
  }

  private getFilterParams(): VendorFilterParams {
    return {
      search: this.searchQuery || undefined,
      status: this.selectedStatus === 'All' ? undefined : this.selectedStatus,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    };
  }

  loadVendors(): void {
    this.isLoading = true;
    this.vendorLoadRequests$.next();
  }

  private getVendorStatusLabel(status: number): string {
    switch (status) {
      case VendorStatus.Active:
        return 'Active';
      case VendorStatus.Pending:
        return 'Pending';
      case VendorStatus.Rejected:
        return 'Rejected';
      case VendorStatus.Blocked:
        return 'Blocked';
      default:
        return 'Unknown';
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
    this.searchReset.emit();
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

    const vendorId = vendor.userId ?? vendor.vendorId ?? vendor.id;
    const vendorName = (vendor.businessName ||
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
          currentStatus
        );
        break;
      case 'verifyPending':
      case 'verifyReject':
        this.handleStatusUpdate(
          vendorId,
          vendorName,
          ApprovalStatus.Rejected,
          currentStatus
        );
        break;
    }
  }

  private getApprovalStatus(
    status: VendorStatus | number | undefined,
  ): ApprovalStatus {
    switch (status) {
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
        noLabel: 'Cancel'
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
          }
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
      this.confirmVendorApproval(vendorId, vendorName, targetStatus);
      return;
    }

    this.confirmVendorRejection(vendorId, vendorName, targetStatus);
  }

  // handle vandor approve
  private confirmVendorApproval(
    vendorId: number,
    vendorName: string,
    targetStatus: ApprovalStatus,
  ): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to approve ${vendorName}?`,
        yesLabel: 'Approve',
        noLabel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (!confirmed) return;

      const payload = { status: targetStatus, rejectionReason: '' };
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
    });
  }

  // handle vendor rejection
  private confirmVendorRejection(
    vendorId: number,
    vendorName: string,
    targetStatus: ApprovalStatus,
  ): void {
    const dialogRef = this.dialog.open(VendorActionDialogComponent, {
      width: '450px',
      data: { vendorName, actionType: 'reject' },
    });

    dialogRef
      .afterClosed()
      .subscribe(
        (result: { confirmed: boolean; message: string } | undefined) => {
          if (!result?.confirmed) return;

          const payload = {
            status: targetStatus,
            rejectionReason: result.message,
          };
          this.vendorService.updateVendorStatus(vendorId, payload).subscribe({
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
      });
  }

  private handleToggleBlockVendor(vendor: VendorTableItem): void {
    const vendorId = vendor.userId ?? vendor.vendorId ?? vendor.id;
    const vendorName = vendor.name || 'Vendor';
    const isCurrentlyBlocked =
      vendor.isBlocked === true || vendor.status === VendorStatus.Blocked;
    const newBlockStatus = !isCurrentlyBlocked;
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

  private isNonPendingDisable(row: unknown): boolean {
    if (!this.isVendorTableItem(row)) {
      return false;
    }
    return row.status === VendorStatus.Pending;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
