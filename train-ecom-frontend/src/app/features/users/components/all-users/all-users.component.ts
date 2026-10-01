import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from 'rxjs';
import {
  AdminUser,
  AdminUserFilterParams,
  AdminUserListResponse,
} from '../../../../core/models/user.model';
import { Role, ROLE_NAME_MAP } from '../../../../core/models/auth.model';
import { VendorStatus } from '../../../../core/models/vendor.model';
import {
  TableAction,
  TableActionEvent,
  TableColumn,
} from '../../../../core/models/table.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css',
})
export class AllUsersComponent implements OnInit, OnDestroy {
  @Input() fixedRole: Role | number = Role.Customer;

  @Input() set externalSearchQuery(value: string) {
    if (this.filterForm.get('search')?.value !== value) {
      this.filterForm.patchValue({ search: value }, { emitEvent: true });
    }
  }
  @Output() searchReset = new EventEmitter<void>();

  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();
  private userLoadRequests$ = new Subject<void>();

  allUsers: AdminUser[] = [];
  isLoading: boolean = false;

  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  statusOptions: Array<{ label: string; value: VendorStatus | 'All' }> = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: VendorStatus.Active },
    { label: 'Blocked', value: VendorStatus.Blocked },
  ];

  roleOptions: Array<{ label: string; value: Role | 'All' }> = [];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl<VendorStatus | 'All'>('All'),
  });

  ngOnInit(): void {
    this.setupUserLoading();
    this.setupSearchStream();
    this.loadRoleOptions();
    this.loadUsers();
  }

  private setupUserLoading(): void {
    this.userLoadRequests$
      .pipe(
        switchMap(() =>
          this.userService.getAllUsers(this.getFilterParams()).pipe(
            catchError(() => {
              this.notification.showError(
                'Failed to fetch users. Please try again later.',
              );
              this.isLoading = false;
              return EMPTY;
            })
          )
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((response: AdminUserListResponse) => {
        const mappedUsers = response.items.map((user) => {
          const isBlockedUser =
            user.isBlocked === true ||
            Number(user.status) === VendorStatus.Blocked;
          return {
            ...user,
            statusDisplay: isBlockedUser ? 'Blocked' : 'Active',
            userStatusClass: isBlockedUser
              ? 'bg-danger-subtle text-danger border border-danger-subtle'
              : 'bg-success-subtle text-success border border-success-subtle',
            actionLabel: isBlockedUser ? 'Unblock' : 'Block',
            actionIcon: isBlockedUser ? 'lock_open' : 'block',
            isBlocked: isBlockedUser,
            formattedAddress: user.address
              ? `${user.address.city || ''}, ${user.address.state || ''}`.replace(
                  /^,\s*|,\s*$/g,
                  '',
                )
              : 'N/A',
            description: user.address
              ? `${user.address.addressLine1 || ''}${user.address.addressLine2 ? ', ' + user.address.addressLine2 : ''}, ${user.address.city || ''}, ${user.address.state || ''} - ${user.address.postalCode || ''}`
              : 'N/A',
          };
        });

        if (this.pageIndex === 0) {
          this.allUsers = mappedUsers;
        } else {
          this.allUsers = [...this.allUsers, ...mappedUsers];
        }

        this.totalRecords = response.totalRecords;
        this.isLoading = false;
      });
  }

  private loadRoleOptions(): void {
    const allowedRoles = [
      Role.Customer,
      Role.Vendor,
      Role.Accounting,
      Role.OfficeAdmin
    ];
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
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (previous, current) =>
            previous.search === current.search &&
            previous.status === current.status,
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadUsers();
      });
  }

  private getFilterParams(): AdminUserFilterParams {
    return {
      search: this.searchQuery || undefined,
      role: this.fixedRole,
      status:
        this.selectedStatus === 'All' ? undefined : this.selectedStatus,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    };
  }

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', truncate: false },
    { key: 'email', label: 'Email', truncate: true },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'formattedAddress', label: 'Location', truncate: true },
    // { key: 'role', label: 'Role', truncate: false },
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
      tooltip: 'Delete User'
    }
  ];

  loadUsers(): void {
    this.isLoading = true;
    this.userLoadRequests$.next();
  }

  onTableScroll(): void {
    if (!this.isLoading && this.allUsers.length < this.totalRecords) {
      this.pageIndex++;
      this.loadUsers();
    }
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
            `Failed to ${action} user. ${errorMessage}`
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
          noLabel: 'Cancel'
        },
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.toggleUserStatus(user);
        }
      });
    } else if (event.action === 'delete') {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Kya aap sach mein ${user.name} ko delete karna chahte hain?`,
          yesLabel: 'Delete',
          noLabel: 'Cancel'
        },
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.userService.deleteUser(Number(user.userId)).subscribe({
            next: (res) => {
              this.notification.showSuccess(
                res.message || 'User Deleted Successfully.',
              );
              this.loadUsers();
            },
            error: (err) => {
              const errorMessage =
                err?.error?.message ||
                'User delete karne mein safalta nahi mili.';
              this.notification.showError(errorMessage);
            },
          });
        }
      });
    }
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }
  get selectedStatus(): VendorStatus | 'All' {
    return this.filterForm.get('status')?.value || 'All';
  }

  get selectedRole(): Role | 'All' {
    return this.filterForm.get('role')?.value || 'All';
  }

  resetFilters(): void {
    this.searchReset.emit();
    this.filterForm.setValue(
      { search: '', status: 'All' },
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
