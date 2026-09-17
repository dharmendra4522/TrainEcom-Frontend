import { Component, inject } from '@angular/core';
import { TableActionEvent, TableColumn } from '../../../../core/models/table.model';
import { AdminUser } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { TableAction } from '../../../../core/models/table.model';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  // for search debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  users: AdminUser[] = [];
  isLoading: boolean = false;

  // Paginator properties
  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  // filter properties
  searchQuery: string = '';
  selectedStatus: string = 'All';
  statusOptions: string[] = ['All', 'Active', 'Blocked'];

  ngOnInit(): void {
    this.setupSearchStream();
    this.loadUsers();
  }

  // search stream setup
  private setupSearchStream(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadUsers();
    });
  }

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', truncate: false },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'formattedAddress', label: 'Location', truncate: true},
    { key: 'statusDisplay', label: 'Status', type: 'badge', badgeClassKey: 'userStatusClass' },
  ];

  actions: TableAction[] = [
    { actionKey: 'toggleBlock', icon: 'block', color: 'warn', tooltip: 'Block / Unblock User' }
  ];

  loadUsers(): void {
    this.isLoading = true;
    const filter = {
      search: this.searchQuery || undefined,
      status: this.selectedStatus === 'All' ? undefined : this.selectedStatus,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    }
    this.userService.getAllUsers(filter).subscribe({
      next: (response) => {
        this.users = response.items.map(user => ({
          ...user,
          statusDisplay: user.isBlocked ? 'Blocked' : 'Active',
          userStatusClass: user.isBlocked
            ? 'bg-danger-subtle text-danger border border-danger-subtle'
            : 'bg-success-subtle text-success border border-success-subtle',
          actionLabel: user.isBlocked ? 'Unblock' : 'Block',
          actionIcon: user.isBlocked ? 'lock_open' : 'block',
          // short address
         formattedAddress: user.address ? `${user.address.city || ''}, ${user.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') 
            : 'N/A',

            // full address on tooltip
          description: user.address ? `${user.address.addressLine1 || ''}${user.address.addressLine2 ? ', ' + user.address.addressLine2 : ''}, ${user.address.city || ''}, ${user.address.state || ''} - ${user.address.postalCode || ''}` : 'N/A'
        }));
       this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: () => {
        this.notification.showError('Failed to fetch users. Please try again later.');
        this.isLoading = false;
      }
    })
  }
  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value;
    this.searchSubject.next(this.searchQuery);
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.pageIndex = 0;
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  toggleUserStatus(user: AdminUser): void {
    const newBlockStatus = !user.isBlocked;
    const action = newBlockStatus ? 'block' : 'unblock';

    this.userService.updateUserStatus(user.userId, { isBlocked: newBlockStatus }).subscribe({
      next: () => {
        this.notification.showSuccess(`User ${action}ed successfully.`);
        this.loadUsers();
      }, error: (error) => {
        const errorMessage = error?.error?.message || 'An error occurred';
        this.notification.showError(`Failed to ${action} user. ${errorMessage}`);
      }
    })
  }


  onActionClick(event: TableActionEvent): void {
    if (event.action === 'toggleBlock') {
      const user = event.row as AdminUser;
      const actionName = user.isBlocked ? 'unblock' : 'block';

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Are you sure you want to ${actionName} ${user.name}?`,
          yesLabel: user.isBlocked ? 'Unblock' : 'Block',
          noLabel: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.toggleUserStatus(user);
        }
      });
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'All';
    this.pageIndex = 0;
    this.loadUsers();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
