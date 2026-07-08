import { Component } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';


@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isAdminRole:boolean = false;

  sidebarTitle: string = '';

  currentMenuItems: MenuItem[] = [];

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin' },
    { label: 'Products', icon: 'inventory_2', route: '/admin/products' },
    { label: 'Orders', icon: 'shopping_cart', route: '/admin/orders' },
    { label: 'Users', icon: 'people', route: '/admin/users' }
  ]

  constructor(){  }

  ngOnInit(): void {
    this.checkRole();
  }

  private checkRole(): void{
    if(window.location.href.includes('/admin')){
      this.isAdminRole = true;
      this.sidebarTitle = 'Admin Menu';
      this.currentMenuItems = this.adminMenuItems;
    } else{
      this.isAdminRole = false;
    }
  }

}
