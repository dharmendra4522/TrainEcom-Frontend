import { Component, inject, ViewChild } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../core/store/auth/auth.selectors';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs/internal/Observable';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';
import { map } from 'rxjs/internal/operators/map';
import { MatSidenav } from '@angular/material/sidenav';


@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {

  private store = inject(Store);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private breakpointObserver = inject(BreakpointObserver);

  sidebarTitle: string = '';
  
  userRole$ = this.store.select(selectUserRole);
  isAccountRoute: boolean = false;
  currentMenuItems: MenuItem[] = [];
  @ViewChild('drawer') drawer!: MatSidenav;

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Products', icon: 'inventory_2', route: '/admin/products' },
    { label: 'Brands', icon: 'branding_watermark', route: '/admin/brands' },
    { label: 'Categories', icon: 'category', route: '/admin/categories' },
    { label: 'Users', icon: 'people', route: '/admin/users' },
  ];

  consumerMenuItems: MenuItem[] = [
    { label: 'My Profile', icon: 'person', route: '/account/profile' },
    { label: 'My Addresses', icon: 'location_on', route: '/account/address' },
    { label: 'My Orders', icon: 'shopping_bag', route: '/account/orders' },
  ];

  isMobile$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay()
  )

  toggleDrawer() {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  constructor() {
    this.isAccountRoute = this.router.url.includes('/account');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.isAccountRoute = event.urlAfterRedirects.includes('/account');
    });
  }

  shouldShowSidebar(role: string | null): boolean {
    if (role === 'Admin') return true;
    if (role === 'Customer' && this.isAccountRoute) return true;
    return false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
