import { Component, inject } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AdminUser } from '../../../../core/models/user.model';
import { Role } from '../../../../core/models/auth.model';
import {
  TableAction,
  TableActionEvent,
  TableColumn,
} from '../../../../core/models/table.model';
import { PageEvent } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css',
})
export class AllUsersComponent {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  // for search debounce
  private destroy$ = new Subject<void>();

  allUsers: AdminUser[] = [];
  isLoading: boolean = false;

  // Paginator properties
  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  statusOptions: string[] = ['All', 'Active', 'Blocked'];
  roleOptions: Role[] = [];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl('All'),
    role: new FormControl('All'),
  });

  ngOnInit(): void {
    this.setupSearchStream();
    this.loadUsers();
    this.loadRoleOptions();
  }

  private loadRoleOptions(): void {
    this.roleOptions = Object.values(Role).filter((role) => role != Role.Admin);
  }

  // search stream setup
  private setupSearchStream(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadUsers();
      });
  }

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', truncate: false },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'formattedAddress', label: 'Location', truncate: true },
    { key: 'role', label: 'ROle', truncate: false },
    {
      key: 'statusDisplay',
      label: 'Status',
      type: 'badge',
      badgeClassKey: 'userStatusClass',
    },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'toggleBlock',
      icon: 'block',
      color: 'warn',
      tooltip: 'Block / Unblock User',
    },
  ];

  loadUsers(): void {
    this.isLoading = true;
    const filter = {
      search: this.searchQuery || undefined,
      status: this.selectedStatus === 'All' ? undefined : this.selectedStatus,
      role: this.selectedRole === 'All' ? undefined : this.selectedRole,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
    };
    this.userService.getAllUsers(filter).subscribe({
      next: (response) => {
        this.allUsers = response.items.map((user) => ({
          ...user,
          statusDisplay: user.isBlocked ? 'Blocked' : 'Active',
          userStatusClass: user.isBlocked
            ? 'bg-danger-subtle text-danger border border-danger-subtle'
            : 'bg-success-subtle text-success border border-success-subtle',
          actionLabel: user.isBlocked ? 'Unblock' : 'Block',
          actionIcon: user.isBlocked ? 'lock_open' : 'block',
          // short address
          formattedAddress: user.address
            ? `${user.address.city || ''}, ${user.address.state || ''}`.replace(
                /^,\s*|,\s*$/g,
                '',
              )
            : 'N/A',

          // full address on tooltip
          description: user.address
            ? `${user.address.addressLine1 || ''}${user.address.addressLine2 ? ', ' + user.address.addressLine2 : ''}, ${user.address.city || ''}, ${user.address.state || ''} - ${user.address.postalCode || ''}`
            : 'N/A',
        }));
        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      },
      error: () => {
        this.notification.showError(
          'Failed to fetch users. Please try again later.',
        );
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  toggleUserStatus(user: AdminUser): void {
    const newBlockStatus = !user.isBlocked;
    const action = newBlockStatus ? 'block' : 'unblock';

    this.userService
      .updateUserStatus(user.userId, { isBlocked: newBlockStatus })
      .subscribe({
        next: () => {
          this.notification.showSuccess(`User ${action}ed successfully.`);
          this.loadUsers();
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'An error occurred';
          this.notification.showError(
            `Failed to ${action} user. ${errorMessage}`,
          );
        },
      });
  }

  // handle actions
  onActionClick(event: TableActionEvent): void {
    if (event.action === 'toggleBlock') {
      const user = event.row as AdminUser;
      const actionName = user.isBlocked ? 'unblock' : 'block';

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Are you sure you want to ${actionName} ${user.name}?`,
          yesLabel: user.isBlocked ? 'Unblock' : 'Block',
          noLabel: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.toggleUserStatus(user);
        }
      });
    }
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }
  get selectedStatus(): string {
    return this.filterForm.get('status')?.value || '';
  }

  get selectedRole(): string {
    return this.filterForm.get('role')?.value || '';
  }

  resetFilters(): void {
    this.filterForm.setValue(
      { search: '', status: 'All', role: 'All' },
      { emitEvent: false },
    );
    this.pageIndex = 0;
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
