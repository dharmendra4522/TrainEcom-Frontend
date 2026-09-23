import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AdminUser, UserStatusFilter } from '../../../../core/models/user.model';
import { Role, ROLE_NAME_MAP } from '../../../../core/models/auth.model';
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
export class AllUsersComponent implements OnInit, OnDestroy {
  @Input() fixedRole: Role | number = Role.Customer;
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  allUsers: AdminUser[] = [];
  isLoading: boolean = false;

  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  statusOptions: Array<{ label: string; value: UserStatusFilter | 'All' }> = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: UserStatusFilter.Active },
    { label: 'Blocked', value: UserStatusFilter.Blocked },
  ];

  roleOptions: Array<{ label: string; value: Role | 'All' }> = [];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl<UserStatusFilter | 'All'>('All'),
    role: new FormControl<Role | 'All'>('All'),
  });

  ngOnInit(): void {
    this.setupSearchStream();
    this.loadRoleOptions();
    this.loadUsers();
  }

  private loadRoleOptions(): void {
    const allowedRoles = [Role.Customer, Role.Vendor, Role.Accounting, Role.OfficeAdmin];
    this.roleOptions = [
      { label: 'All Roles', value: 'All' },
      ...allowedRoles.map((role) => ({
        label: ROLE_NAME_MAP[role] || `Role ${role}`,
        value: role,
      })),
    ];
  }

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
    { key: 'role', label: 'Role', truncate: false },
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
    {
      actionKey: 'delete',
      icon: 'delete',
      color: 'warn',
      tooltip: 'Delete User',
    },
  ];

  loadUsers(): void {
    this.isLoading = true;
    const filter = {
      search: this.searchQuery || undefined,
      status: this.selectedStatus === 'All' ? undefined : (this.selectedStatus as UserStatusFilter),
      role: this.fixedRole !== undefined ? this.fixedRole : (this.selectedRole === 'All' ? undefined : (this.selectedRole as Role)),
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
    };
    this.userService.getAllUsers(filter).subscribe({
      next: (response) => {
        this.allUsers = response.items.map((user) => ({
          ...user,
          userId: Number(user.userId),
          statusDisplay: user.isBlocked ? 'Blocked' : 'Active',
          userStatusClass: user.isBlocked
            ? 'bg-danger-subtle text-danger border border-danger-subtle'
            : 'bg-success-subtle text-success border border-success-subtle',
          actionLabel: user.isBlocked ? 'Unblock' : 'Block',
          actionIcon: user.isBlocked ? 'lock_open' : 'block',
          formattedAddress: user.address
            ? `${user.address.city || ''}, ${user.address.state || ''}`.replace(
                /^,\s*|,\s*$/g,
                '',
              )
            : 'N/A',
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
      .updateUserStatus(Number(user.userId), { isBlocked: newBlockStatus })
      .subscribe({
        next: () => {
          this.notification.showSuccess(`User ${action}ed successfully.`);
          this.loadUsers();
        },
        error: (error: Record<string, unknown>) => {
          const errBody = error['error'] as { message?: string } | undefined;
          const errorMessage = errBody?.message || 'An error occurred';
          this.notification.showError(
            `Failed to ${action} user. ${errorMessage}`,
          );
        },
      });
  }

  onActionClick(event: TableActionEvent): void {
    const user = event.row as AdminUser;
    if (event.action === 'toggleBlock') {
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
    } else if( event.action === 'delete'){
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Kya aap sach mein ${user.name} ko delete karna chahte hain?`,
          yesLabel: 'Delete',
          noLabel: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.userService.deleteUser(Number(user.userId)).subscribe({
            next: (res) => {
              this.notification.showSuccess(res.message || 'User Deleted Successfully.');
              this.loadUsers();
            },
            error: (err) => {
              const errorMessage = err?.error?.message || 'User delete karne mein safalta nahi mili.';
              this.notification.showError(errorMessage);
            }
          });
        }
      });
    }
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }
  get selectedStatus(): UserStatusFilter | 'All' {
    return this.filterForm.get('status')?.value || 'All';
  }

  get selectedRole(): Role | 'All' {
    return this.filterForm.get('role')?.value || 'All';
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

