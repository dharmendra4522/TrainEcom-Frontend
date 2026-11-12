import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { MenuItem } from '../../../core/models/menu-item.model';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { selectUserRole } from '../../../core/store/auth/auth.selectors';
import { getRoleMenuItems } from '../../../core/config/role-permission.config';
import { Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private store = inject(Store);

  @Input() menuItems: MenuItem[] = [];
  @Input() sidebarType: string = 'admin';

  ngOnInit(): void{
    this.store.select(selectUserRole).subscribe((role) => {
      const vendorStatus = localStorage.getItem('vendorStatus') || 'Pending';
      this.menuItems = getRoleMenuItems(role as Role, vendorStatus);
    })
  }

   onLogout(): void {
      this.store.dispatch(AuthActions.logout());
    }
}
