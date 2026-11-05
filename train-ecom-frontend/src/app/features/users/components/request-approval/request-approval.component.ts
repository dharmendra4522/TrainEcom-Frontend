import { FormControl } from '@angular/forms';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TableAction, TableActionEvent, TableColumn } from '../../../../core/models/table.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { RequestStatus, RequestType, VendorProfileUpdateItem } from '../../../../core/models/request-approve.model';
import { Router } from '@angular/router';
import { RequestApprovalService } from '../../../../core/services/request-approval.service';
import { VendorActionDialogComponent } from '../../../../shared/components/vendor-action-dialog/vendor-action-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-request-approval',
  templateUrl: './request-approval.component.html',
  styleUrl: './request-approval.component.css'
})
export class RequestApprovalComponent {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<RequestApprovalComponent>);
  private requestApprovalService = inject(RequestApprovalService);
  private notificationService = inject(NotificationService);

  searchControl = new FormControl('');
  private pageNumber: number = 1;
  private pageSize: number = 10;
  private searchTerm: string = '';
  public isLoading: boolean = false;
  hasMoreData: boolean = true;
  requestList: VendorProfileUpdateItem[] = [];
  isRefreshRequired: boolean = false;

  @Output() loadMore = new EventEmitter();
  @Output() requestCountChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();

  // table column data
  columns: TableColumn[] = [
    {
      key: 'requestId',
      label: 'Request ID',
      type: 'text',
      sortable: true,
      clickable: true
    },
    {
      key: 'requestBy',
      label: 'Request By',
      type: 'text',
      truncate: true,
      sortable: true
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      type: 'date',
      truncate: true,
      sortable: true
    },
    {
      key: 'requestTypeLabel',
      label: 'Request Type',
      type: 'text',
      truncate: true,
      sortable: true
    },
    {
      key: 'requestMessage',
      label: 'Request Message',
      type: 'text',
      truncate: true,
      sortable: true
    }
  ];

  // actions of table
  actions: TableAction[] = [
    {
      actionKey: 'approve',
      icon: 'check_circle',
      color: 'secondary',
      tooltip: 'Approve'

    },
    {
      actionKey: 'reject',
      icon: 'cancel',
      color: 'warn',
      tooltip: 'Reject'
    },
    {
      actionKey: 'view-profile',
      icon: 'visibility',
      color: 'primary',
      tooltip: 'View Profile'
    }
  ];

  ngOnInit(): void {
    this.fetchRequestList();
    this.setUpSearchControl();
  }

  // handle the fetching all list of requested vendore for profile update
  private fetchRequestList(): void {
    this.isLoading = true;
    this.requestApprovalService.fetchRequestList(this.pageNumber, this.pageSize, this.searchTerm, RequestStatus.Pending).subscribe({
      next: (response) => {
        this.requestList = response.items.map(item => ({
          ...item,
          requestTypeLabel: this.getRequestTypeLabel(item.requestType)
        }));
        this.hasMoreData = response.pageNumber < response.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    })
  }

  // handle request type label
  private getRequestTypeLabel(type: RequestType): string {
    switch (type) {
      case RequestType.ProfileUpdate:
        return 'Profile Update'
      default:
        return 'Unknow'
    }
  }

  private setUpSearchControl(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(search => {
        this.pageNumber = 1;
        return this.requestApprovalService.fetchRequestList(this.pageNumber, this.pageSize, search ?? '', RequestStatus.Pending);
      })
    ).subscribe(response => {
      this.requestList = response.items.map(item => ({
        ...item,
        requestTypeLabel: this.getRequestTypeLabel(item.requestType)
      }));
      this.hasMoreData = response.pageNumber < response.totalPages;
    })
  }

  // handle table action click
  onActionClick(event: TableActionEvent): void {
    switch (event.action) {
      case 'approve':
        this.onApprove(event.row as VendorProfileUpdateItem);
        break;
      case 'reject':
        this.onReject(event.row as VendorProfileUpdateItem);
        break;
      case 'view-profile':
        this.onViewProfile(event.row as VendorProfileUpdateItem);
        break;
      default:
        console.warn('unknow action');
        break;
    }
  }

  // handle approve action
  private onApprove(row: VendorProfileUpdateItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Request',
        message: `Are you sure want to Approve ${row.requestBy}'s request?`
      }
    })
    dialogRef.afterClosed().subscribe({
      next: (confirm) => {
        if (!confirm) {
          return;
        }
        const payload = {
          requestId: row.requestId,
          status: RequestStatus.Approved,
          rejectionReason: ''
        }
        this.requestApprovalService.verifyRequest(row.userId, payload).subscribe({
          next: () => {
            this.notificationService.showSuccess('Vendor profile update request is approve successfully', 'close');
            this.isRefreshRequired = true;
            this.pageNumber = 1;
            this.fetchRequestList();
          },
          error: (err) => {
            console.log('faild to update vendor status', err);
          }
        })
      }
    })
  }

  // handle reject action
  private onReject(row: VendorProfileUpdateItem): void {
    const dialogRef = this.dialog.open(VendorActionDialogComponent, {
      width: '500px',
      data: {
        vendorName: row.requestBy,
        actionType: 'reject'
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (!result?.confirmed) {
        return;
      }
      const payload = {
        requestId: row.requestId,
        status: RequestStatus.Rejected,
        rejectionReason: result.message
      }
      this.requestApprovalService.verifyRequest(row.userId, payload).subscribe({
        next: () => {
          this.notificationService.showSuccess('Vendor profile update request reject successfull', 'close');
          this.isRefreshRequired = true;
          this.pageNumber = 1;
          this.fetchRequestList();
        }, error: (err) => {
          console.log('faild to update vendor status', err)
        }
      })

    })
  }

  private onViewProfile(row: VendorProfileUpdateItem): void {
    const userId = row.userId;
    this.router.navigate([`/admin/users/manage/${userId}`]);
    this.dialog.closeAll();
  }

  closeDialog(): void {
    this.dialog.closeAll();
    this.dialogRef.close({
      refreshToken: this.isRefreshRequired
    })
  }

  // handle pagination
  loadMoreData(): void {
    if (this.isLoading || !this.hasMoreData) {
      return;
    }
    this.isLoading = true;
    this.pageNumber++;
  }

}
