import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
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
  takeUntil
} from 'rxjs';
import {
  AdminUser,
  AdminUserFilterParams,
  AdminUserListResponse,
  UserFilterColumn,
  UserListField
} from '../../../../core/models/user.model';
import { Role } from '../../../../core/models/auth.model';
import { VendorStatus } from '../../../../core/models/vendor.model';
import {
  TableAction,
  TableActionEvent,
  TableColumn
} from '../../../../core/models/table.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
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
  showHeaderFilter: boolean = true;
  headerFilters: Record<string, string> = {};
  selectedStatusIds: number[] = [];

  filterForm = new FormGroup({
    search: new FormControl('')
  });

  ngOnInit(): void {
    this.setupUserLoading();
    this.setupSearchStream();
    this.loadUsers();
  }

  private setupUserLoading(): void {
    this.userLoadRequests$
      .pipe(
        switchMap(() =>
          this.userService.getAllUsers(this.getFilterParams()).pipe(
            catchError(() => {
              this.notification.showError(
                'Failed to fetch users. Please try again later.'
              );
              this.isLoading = false;
              return EMPTY;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((response: AdminUserListResponse) => {
        const mappedUsers = response.items.map((user) => {
          const isBlockedUser = this.isBlockedRow(user);
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

  private setupSearchStream(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (previous, current) =>
            previous.search === current.search
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadUsers();
      });
  }

  private getFilterParams(): AdminUserFilterParams {
    const headerSearch = this.getHeaderSearchValue();

    return {
      Search: headerSearch || this.searchQuery || undefined,
      SearchField: headerSearch
        ? this.getSearchField()
        : undefined,
      Role: this.fixedRole,
      Status:
        this.selectedStatusIds.length
          ? this.selectedStatusIds
          : undefined,
      PageNumber: this.pageIndex + 1,
      PageSize: this.pageSize
    };
  }


  columns: TableColumn[] = [
    { key: 'userId', label: 'ID', type: 'number', truncate: false, filterable: true, filterType: 'search' },
    { key: 'name', label: 'Name', truncate: false, filterable: true, filterType: 'search' },
    { key: 'email', label: 'Email', truncate: true, filterable: true, filterType: 'search' },
    { key: 'phoneNumber', label: 'Phone', filterable: true, filterType: 'search' },
    { key: 'formattedAddress', label: 'Location', truncate: true, filterable: true, filterType: 'search' },
    {
      key: 'statusDisplay',
      label: 'Status',
      type: 'badge',
      badgeClassKey: 'userStatusClass',
      filterable: true, filterType: 'dropdown'
    }
  ];

  actions: TableAction[] = [
    {
      actionKey: 'toggleBlock',
      icon: (row) => this.isBlockedRow(row) ? 'lock_open' : 'block',
      label: (row) => this.isBlockedRow(row) ? 'Unblock' : 'Block',
      color: 'warn',
      tooltip: 'Block / Unblock User'
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

  private isBlockedRow(row: unknown): boolean {
    if (!this.isRecord(row)) {
      return false;
    }
    return row['isBlocked'] === true || Number(row['status']) === VendorStatus.Blocked;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  onTableScroll(): void {
    if (!this.isLoading && this.allUsers.length < this.totalRecords) {
      this.pageIndex++;
      this.loadUsers();
    }
  }

  toggleUserStatus(user: AdminUser): void {
    const newBlockStatus = !this.isBlockedRow(user);
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
        }
      });
  }

  onActionClick(event: TableActionEvent): void {
    const user = event.row as AdminUser;
    if (event.action === 'toggleBlock') {
      const isBlocked = this.isBlockedRow(user);
      const actionName = isBlocked ? 'unblock' : 'block';

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: `Are you sure you want to ${actionName} ${user.name}?`,
          yesLabel: isBlocked ? 'Unblock' : 'Block',
          noLabel: 'Cancel'
        }
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
            }
          });
        }
      });
    }
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }

  // get selected column 
  private getSearchField(): UserListField | undefined {
    const activeKey = Object.keys(this.headerFilters).find(
      key => this.headerFilters[key]?.trim()
    );
    switch (activeKey) {
      case UserFilterColumn.UserId:
        return UserListField.UserID;
      case UserFilterColumn.Name:
        return UserListField.Name;
      case UserFilterColumn.Email:
        return UserListField.Email;
      case UserFilterColumn.PhoneNumber:
        return UserListField.PhoneNumber;
      case UserFilterColumn.FormattedAddress:
        return UserListField.AddressCity;
      default:
        return undefined;
    }
  }

  // handle header search
  private getHeaderSearchValue(): string | undefined {
    return (
      this.headerFilters[UserFilterColumn.UserId] || this.headerFilters[UserFilterColumn.Name] || this.headerFilters[UserFilterColumn.Email] || this.headerFilters[UserFilterColumn.PhoneNumber] || this.headerFilters[UserFilterColumn.FormattedAddress] || undefined
    );
  }

  // handle status map
  dropdownOptionsMap = {
    statusDisplay: [
      {
        id: VendorStatus.Active,
        label: 'Active',
      },
      {
        id: VendorStatus.Blocked,
        label: 'Blocked',
      },
    ],
  };

  selectedFiltersMap: Record<string, (string | number)[]> = {
    statusDisplay: [],
  };

  // handle dropdown selection change
  onDropdownSelectionChange(event: {
    columnKey: string;
    option: {
      id: string | number;
      label: string;
    };
  }): void {
    if (event.columnKey !== 'statusDisplay') {
      return;
    }
    const selected =
      this.selectedFiltersMap['statusDisplay'] ?? [];
    const exists =
      selected.includes(event.option.id);

    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      statusDisplay: exists
        ? selected.filter(
          x => x !== event.option.id
        )
        : [...selected, event.option.id]
    };
  }

  onFilterApply(event: { columnKey: string }): void {
    if (event.columnKey !== 'statusDisplay') {
      return;
    }
    this.selectedStatusIds = (this.selectedFiltersMap['statusDisplay'] ?? []).map(Number);
    this.pageIndex = 0;
    this.loadUsers();
  }

  onFilterClear(columnKey: string): void {
    if (columnKey !== 'statusDisplay') {
      return;
    }
    this.selectedStatusIds = [];
    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      statusDisplay: []
    };
    this.pageIndex = 0;
    this.loadUsers();
  }

  resetFilters(): void {
    this.searchReset.emit();
    this.filterForm.setValue(
      { search: '' },
      { emitEvent: false }
    );
    this.pageIndex = 0;
    this.loadUsers();
  }

  onHeaderFilterChange(filters: Record<string, string>): void {
    this.headerFilters = filters;
    this.pageIndex = 0;
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
