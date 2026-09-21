import { Component, inject } from '@angular/core';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent {
  activeTab: 'users' | 'vendors' | 'customers' = 'users';

  onTabSwitch(tab: 'users' | 'vendors' | 'customers') {
    this.activeTab = tab;
  }
}
