import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, map, takeUntil, finalize } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';
import { AdminUser } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private destroy$ = new Subject<void>();

  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  isLoading = false;

  searchControl = new FormControl('');
  pageIndex = 0;
  pageSize = 10;
  totalRecords = 0;

  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'role', label: 'Role', type: 'badge' },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'view',
      icon: 'visibility',
      color: 'primary',
      tooltip: 'View User',
    },
  ];

  ngOnInit(): void {
    this.loadUsers();

    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.applyFilter(query || '');
      });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (users: AdminUser[]) => {
        this.users = users;
        this.totalRecords = users.length;
        this.applyFilter(this.searchControl.value || '');
      },
      error: (err) => {
        this.notification.showError('Failed to load users. Please try again.', 'Close');
      },
    });
  }

  private applyFilter(query: string): void {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.role || '').toLowerCase().includes(q)
      );
    }
    this.totalRecords = this.filteredUsers.length;
  }

  handleTableAction(event: TableActionEvent): void {
    const user = event.row as AdminUser;
    if (event.action === 'view') {
      // Future: open a detail dialog or navigate
      this.notification.showSuccess(`Viewing user: ${user.name}`, 'Close');
    }
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
