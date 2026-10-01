import { Component, inject, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Role } from '../../../../core/models/auth.model';

import { FormControl } from '@angular/forms';

export interface TabItem {
  label: string;
  value: 'customers' | 'vendors';
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);

  activeTab: 'customers' | 'vendors' = 'customers';
  selectedindex: number = 0;
  globalSearch = new FormControl('');
  searchQueryText: string = '';

  get roleNumber(): number {
    return this.activeTab === 'customers' ? Role.Customer : Role.Vendor;
  }

  tabs: TabItem[] = [
    { label: 'Customers', value: 'customers' },
    { label: 'Vendors', value: 'vendors' },
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const roleParams = Number(params['role']);
      if (roleParams === Role.Vendor) {
        this.activeTab = 'vendors';
        this.selectedindex = 1;
      } else if (roleParams === Role.Customer) {
        this.activeTab = 'customers';
        this.selectedindex = 0;
      }
    });

    this.globalSearch.valueChanges.subscribe((val) => {
      this.searchQueryText = val || '';
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    const selectedTab = this.tabs[event.index];
    if (selectedTab) {
      this.activeTab = selectedTab.value;
      this.selectedindex = event.index;
      this.globalSearch.setValue('');
    }
  }
}
