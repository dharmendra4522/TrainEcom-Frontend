import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

export interface TabItem {
  label: string;
  value: 'customers' | 'vendors';
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent {
  activeTab: 'customers' | 'vendors' = 'customers';

  tabs: TabItem[] = [
    { label: 'Customers', value: 'customers' },
    { label: 'Vendors', value: 'vendors' },
  ];

  onTabChange(event: MatTabChangeEvent): void {
    const selectedTab = this.tabs[event.index];
    if (selectedTab) {
      this.activeTab = selectedTab.value;
    }
  }
}

