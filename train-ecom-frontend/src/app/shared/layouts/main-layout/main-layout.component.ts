import { Component, inject } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../core/store/auth/auth.selectors';


@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {

  private store = inject(Store);
  
  sidebarTitle: string = '';

  userRole$ = this.store.select(selectUserRole);

  currentMenuItems: MenuItem[] = [];

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Products', icon: 'inventory_2', route: '/admin/products' },
    { label: 'Orders', icon: 'shopping_cart', route: '/admin/orders' },
    { label: 'Users', icon: 'people', route: '/admin/users' },
  ];

  constructor() {}

}
