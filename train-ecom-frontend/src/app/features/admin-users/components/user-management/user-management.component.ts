import { Component } from '@angular/core';
import { TableColumn } from '../../../../core/models/table.model';
import { AdminUser } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent {
  
  users: AdminUser[] = [];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'role', label: 'Role', type: 'badge' },
  ];
}
