import { Component, inject } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../core/store/auth/auth.selectors';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';


@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {

  private store = inject(Store);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  sidebarTitle: string = '';

  userRole$ = this.store.select(selectUserRole);
  isAccountRoute: boolean = false;
  currentMenuItems: MenuItem[] = [];

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Products', icon: 'inventory_2', route: '/admin/products' },
    { label: 'Orders', icon: 'shopping_cart', route: '/admin/orders' },
    { label: 'Users', icon: 'people', route: '/admin/users' },
  ];

  consumerMenuItems: MenuItem[] = [
    { label: 'My Profile', icon: 'person', route: '/account/profile' },
    { label: 'My Addresses', icon: 'location_on', route: '/account/address' },
    { label: 'My Orders', icon: 'shopping_bag', route: '/account/orders' },
  ];

  constructor() {
    this.isAccountRoute = this.router.url.includes('/account');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.isAccountRoute = event.urlAfterRedirects.includes('/account');
    });
  }

  shouldShowSidebar(role: string | null): boolean{
    if(role === 'Admin') return true;
    if(role === 'Customer' && this.isAccountRoute) return true;
    return false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
