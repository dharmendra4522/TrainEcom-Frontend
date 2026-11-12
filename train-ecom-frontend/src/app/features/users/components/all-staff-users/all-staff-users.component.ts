import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { StaffService } from '../../../../core/services/staff.service';
import { StaffUser, StaffUserFilter } from '../../../../core/models/staffUser.model';
import { TableAction, TableActionEvent, TableColumn } from '../../../../core/models/table.model';
import { FormControl, FormGroup } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

@Component({
  selector: 'app-all-staff-users',
  templateUrl: './all-staff-users.component.html',
  styleUrl: './all-staff-users.component.css'
})
export class AllStaffUsersComponent {
  private staffService = inject(StaffService);

  @Input() set externalSearchQuery(value: string) {
    if (this.filterForm.get('search')?.value !== value) {
      this.filterForm.patchValue({ search: value }, { emitEvent: true });
    }
  }
  @Output() searchReset = new EventEmitter<void>();
  filterForm = new FormGroup({
    search: new FormControl('')
  });

  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecord: number = 0;
  staffUsers: StaffUser[] = [];
  isLoading: boolean = false;
  showHeaderFilter: boolean = true;

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number', truncate: false, filterable: true, filterType: 'search', clickable: true },
    { key: 'name', label: 'Name', truncate: false, filterable: true, filterType: 'search' },
    { key: 'phoneNumber', label: 'Phone', filterable: true, filterType: 'search' },
    { key: 'email', label: 'Email', truncate: true, filterable: true, filterType: 'search' },
    { key: 'role', label: 'Role', filterable: true, filterType: 'dropdown' },
    { key: 'statusLabel', label: 'Status', filterable: true, filterType: 'dropdown', type: 'badge' }
  ];
  actions: TableAction[] = [
    {
      actionKey: 'toggleBlock',
      icon: (row) => this.isBlocked(row) ? 'lock_open' : 'lock',
      label: (row) => this.isBlocked(row) ? 'Unblock' : 'Block',
      color: (row) => this.isBlocked(row) ? 'primary' : 'warn',
      tooltip: 'Block/Unblock Staff',
    }
  ]

  ngOnInit(): void {
    this.setupSearchStream();
    this.fetchStaffUsers();
  }

  // handle staff user list
  private fetchStaffUsers(): void {
    this.isLoading = true;
    this.staffService.fetchStaffUsers(this.getFilterParams()).subscribe({
      next: (response) => {
        this.staffUsers = response.items.map(user => ({
          ...user,
          statusLabel: user.isBlocked ? 'Blocked' : 'Active'
        }));
        this.totalRecord = response.totalRecords;
        this.isLoading = false;
      }, error: (error) => {
        console.error('Error fetching staff users:', error);
        this.isLoading = false;
      }
    })
  }

  // handle search
  private setupSearchStream(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.pageNumber = 1;
      this.fetchStaffUsers();
    });
  }

  private getFilterParams(): StaffUserFilter {
    return {
      searchTerm: this.searchQuery,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    };
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
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
    }
  }

  // handle block/unblock user
  private toggleBlockUser(user: StaffUser): void {
    const action = user.isBlocked ? 'unblock' : 'block';
    console.log(`Performing ${action} action for user:`, user.id);
  }


  // handle header filter
  onHeaderFilterChange(filters: Record<string, string>): void {
    console.log('Header filters changed:', filters);
    this.pageNumber = 1;
    this.fetchStaffUsers();
  }
}
