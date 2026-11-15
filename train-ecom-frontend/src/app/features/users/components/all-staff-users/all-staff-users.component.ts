import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { StaffService } from '../../../../core/services/staff.service';
import { StaffFilterColumn, StaffUser, StaffUserFilter, StaffUsersListField } from '../../../../core/models/staffUser.model';
import { TableAction, TableActionEvent, TableColumn } from '../../../../core/models/table.model';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, startWith} from 'rxjs';
import { Role } from '../../../../core/models/auth.model';
import { VendorStatus } from '../../../../core/models/vendor.model';
import { MatDialog } from '@angular/material/dialog';
import { AddUsersComponent } from '../add-users/add-users.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-all-staff-users',
  templateUrl: './all-staff-users.component.html',
  styleUrl: './all-staff-users.component.css'
})
export class AllStaffUsersComponent {
  private staffService = inject(StaffService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  // handle external search query input
  @Input() set externalSearchQuery(value: string) {
    if (this.filterForm.get('search')?.value !== value) {
      this.filterForm.patchValue({ search: value }, { emitEvent: true });
    }
  }
  // handle search reset output
  @Output() searchReset = new EventEmitter<void>();
  @Input() refreshSignal: number = 0;

  // form group for search input 
  filterForm = new FormGroup({
    search: new FormControl('')
  });

  // component state variables
  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecord: number = 0;
  staffUsers: StaffUser[] = [];
  isLoading: boolean = false;
  showHeaderFilter: boolean = true;
  headerFilters: Record<string, string> = {};
  roleFilter: Role[] = [];
  statusFilter: number[] = [];

  // Define table columns and actions
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number', truncate: false, filterable: true, filterType: 'search', clickable: true },
    { key: 'name', label: 'Name', truncate: false, filterable: true, filterType: 'search' },
    { key: 'phoneNumber', label: 'Phone', filterable: true, filterType: 'search' },
    { key: 'email', label: 'Email', truncate: true, filterable: true, filterType: 'search' },
    { key: 'roleLabel', label: 'Role', filterable: true, filterType: 'dropdown' },
    { key: 'statusLabel', label: 'Status', filterable: true, filterType: 'dropdown', type: 'badge', badgeClassKey: 'statusClass' }
  ];
  // Define table actions for each row
  actions: TableAction[] = [
    {
      actionKey: 'toggleBlock',
      icon: (row) => this.isBlocked(row) ? 'lock_open' : 'lock',
      label: (row) => this.isBlocked(row) ? 'Unblock' : 'Block',
      color: (row) => this.isBlocked(row) ? 'primary' : 'warn',
      tooltip: 'Block/Unblock Staff',
    },
    {
      actionKey: 'edit',
      icon: 'edit',
      label: 'Edit',
      color: 'primary',
      tooltip: 'Edit Staff User'
    },
    {
      actionKey: 'delete',
      icon: 'delete',
      label: 'Delete',
      color: 'warn',
      tooltip: 'Delete Staff User'
    }
  ]

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshSignal'] && !changes['refreshSignal'].firstChange) {
      this.pageNumber = 1;
      this.fetchStaffUsers();
    }
  }

  ngOnInit(): void {
    this.setupSearchStream();
  }


  // handle staff user list
  private fetchStaffUsers(): void {
    this.isLoading = true;
    this.staffService.fetchStaffUsers(this.getFilterParams()).subscribe({
      next: (response) => {
        const mappedStaffUsers = response.items.map(user => this.mapStaffUser(user));
        if (this.pageNumber === 1) {
          this.staffUsers = mappedStaffUsers;
        } else {
          this.staffUsers = [...this.staffUsers, ...mappedStaffUsers];
        }
        this.totalRecord = response.totalRecords;
        this.isLoading = false;
      }, error: () => {

        this.isLoading = false;
      }
    })
  }

  // handle search
  private setupSearchStream(): void {
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value), // emit the initial value to trigger the search on component initialization
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => {
        this.pageNumber = 1;
        return this.staffService.fetchStaffUsers(this.getFilterParams());
      })
    ).subscribe({
      next: (response) => {
        this.staffUsers = response.items.map(user => this.mapStaffUser(user));
        this.totalRecord = response.totalRecords;
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  // handle mapping of staff user data for display
  private mapStaffUser(user: StaffUser): StaffUser {
  return {
    ...user,
    statusLabel: user.isBlocked ? 'Blocked' : 'Active',
    statusClass: user.isBlocked
      ? 'bg-danger-subtle text-danger border border-danger-subtle'
      : 'bg-success-subtle text-success border border-success-subtle',
    roleLabel: this.getRoleLabel(user.role)
  };
}


  // handle table scroll for pagination
  onTableScroll(): void {
    if (this.staffUsers.length < this.totalRecord) {
      this.pageNumber++;
      this.fetchStaffUsers();
    }
  }

  // handle get filter params for api call
  private getFilterParams(): StaffUserFilter {
    const headerSearch = this.getHeaderSearchValue();
    return {
      searchTerm: headerSearch || this.searchQuery,
      searchField: headerSearch ? this.getSearchField() : undefined,
      roleFilter: this.roleFilter,
      statusFilter: this.statusFilter,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }

  // handle search query from header filter
  private getSearchField(): StaffUsersListField | undefined {
    const activeKey = Object.keys(this.headerFilters).find(
      key => this.headerFilters[key]?.trim()
    );
    switch (activeKey) {
      case StaffFilterColumn.Id:
        return StaffUsersListField.Id;
      case StaffFilterColumn.Name:
        return StaffUsersListField.Name;
      case StaffFilterColumn.Email:
        return StaffUsersListField.Email;
      case StaffFilterColumn.PhoneNumber:
        return StaffUsersListField.PhoneNumber;
      default:
        return undefined;
    }
  }

  // handle get header search value for api call
  private getHeaderSearchValue(): string | undefined {
    return (
      this.headerFilters[StaffFilterColumn.Id] ||
      this.headerFilters[StaffFilterColumn.Name] ||
      this.headerFilters[StaffFilterColumn.Email] ||
      this.headerFilters[StaffFilterColumn.PhoneNumber] || undefined
    );
  }

  // handle dropdown options for role filter
  dropdownOptionsMap = {
    roleLabel: [
      { id: Role.Accountant, label: 'Accountant' },
      { id: Role.StoreMananger, label: 'Store Manager' },
      { id: Role.InventoryManager, label: 'Inventory Manager ' },
      { id: Role.OrderManager, label: 'Order Manager' },
      { id: Role.CustomerSupport, label: 'Customer Support' },
      { id: Role.ProductEditor, label: 'Product Editor' },
    ],
    statusLabel: [
      { id: VendorStatus.Blocked, label: 'Blocked' },
      { id: VendorStatus.Active, label: 'Active' }
    ]
  }

  // handle selected filters for role filter
  selectedFiltersMap: Record<string, (string | number)[]> = {
    roleLabel: [],
    statusLabel: []
  }

  // handle dropdown selection change for role filter
  onDropdownSelectionChange(event: {
    columnKey: string;
    option: {
      id: string | number;
      label: string;
    };
  }): void {
    if (event.columnKey !== StaffFilterColumn.RoleLabel && event.columnKey !== StaffFilterColumn.StatusLabel) {
      return;
    }
    const selected = this.selectedFiltersMap[event.columnKey] ?? [];
    const exists = selected.includes(event.option.id);
    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      [event.columnKey]: exists
        ? selected.filter(id => id !== event.option.id)
        : [...selected, event.option.id]
    }
  }

  // handle filter apply for role filter
  onFilterApply(event: { columnKey: string }): void {
    if (event.columnKey !== StaffFilterColumn.RoleLabel && event.columnKey !== StaffFilterColumn.StatusLabel) {
      return;
    }
    this.roleFilter = (this.selectedFiltersMap[StaffFilterColumn.RoleLabel] as Role[]) ?? [];
    this.statusFilter = (this.selectedFiltersMap[StaffFilterColumn.StatusLabel] as number[]) ?? [];
    this.pageNumber = 1;
    const currValue = this.filterForm.get('search')?.value || '';
    this.filterForm.patchValue({ search: currValue }, { emitEvent: true });
  }

  onFilterClear(columnKey: string): void {
    if (columnKey !== StaffFilterColumn.RoleLabel && columnKey !== StaffFilterColumn.StatusLabel) {
      return;
    }
    this.roleFilter = [];
    this.statusFilter = [];
    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      roleLabel: [],
      statusLabel: []
    }

    this.pageNumber = 1;
    const currValue = this.filterForm.get('search')?.value || '';
    this.filterForm.patchValue({ search: currValue }, { emitEvent: true });
  }

  onHeaderFilterChange(filters: Record<string, string>): void {
    this.headerFilters = filters;
    this.pageNumber = 1;
    const currValue = this.filterForm.get('search')?.value || '';
    this.filterForm.patchValue({ search: currValue }, { emitEvent: true });
  }

  // hanle table action click
  private isBlocked(row: unknown): boolean {
    if (!this.isRecord(row)) {
      return false;
    }
    return row['isBlocked'] === true;
  }

  private isRecord(row: unknown): row is StaffUser {
    return (row as StaffUser).id !== undefined;
  }

  // handle table action click 
  onAction(event: TableActionEvent) {
    const actionKey = event.action;
    const row = event.row as StaffUser;
    switch (actionKey) {
      case 'toggleBlock':
        this.toggleBlockUser(row);
        break;
      case 'edit':
        this.openUpdateStaffDialog(row);
        break;
      case 'delete':
        this.deleteStaffUser(row);
        break;
    }
  }

  // handle block/unblock user
  private toggleBlockUser(user: StaffUser): void {
    const action = user.isBlocked ? 'unblock' : 'block';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to ${action} ${user.name}?`,
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.staffService.updateStaffUserStatus(user.id, !user.isBlocked).subscribe({
          next: () => {
            this.notificationService.showSuccess(`User ${user.name} has been ${action}ed successfully`, 'Close');
            this.pageNumber = 1;
            this.fetchStaffUsers();
          }, error: () => {
            this.notificationService.showError(`Failed to ${action} user ${user.name}`, 'Close');
          }
        });
      }
    });
  }

  // handle update staff user details
  private openUpdateStaffDialog(user: StaffUser): void {
    const dialogRef = this.dialog.open(AddUsersComponent, {
      width: '600px',
      height: '450px',
      disableClose: true,
      data: { isEdit: true, staffData: user }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.pageNumber = 1;
        this.fetchStaffUsers();
      }
    });
  }

  // handle delete staff user
  private deleteStaffUser(user: StaffUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `Are you sure you want to delete ${user.name}?`,
        yesLabel: 'Delete',
        noLabel: 'Cancel',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.staffService.deleteStaffUser(user.id).subscribe({
          next: () => {
            this.notificationService.showSuccess(`User ${user.name} has been deleted successfully`, 'Close');
            this.pageNumber = 1;
            this.fetchStaffUsers();
          }, error: () => {
            this.notificationService.showError(`Failed to delete user ${user.name}`, 'Close');
          }
        });
      }
    });
  }

  // convert enum into readable text
  getRoleLabel(role: Role[] | Role): string {
    const roleArray = Array.isArray(role) ? role : [role];
    return roleArray.map(role => {
      switch (role) {
        case Role.Accountant:
          return 'Accountant';
        case Role.CustomerSupport:
          return 'Customer Support';
        case Role.OrderManager:
          return 'Order Manager';
        case Role.ProductEditor:
          return 'Product Editor';
        case Role.StoreMananger:
          return 'Store Manager';
        case Role.InventoryManager:
          return 'Inventory Manager';
        default:
          return 'Unknown';
      }
    }).join(', ');
  }
}
