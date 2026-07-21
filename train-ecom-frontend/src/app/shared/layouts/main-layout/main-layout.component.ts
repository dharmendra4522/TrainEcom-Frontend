import { Component, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../core/store/auth/auth.selectors';
import { NavigationEnd, Router } from '@angular/router';
import { filter, takeUntil, shareReplay, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { SidePanelComponent } from '../../components/side-panel/side-panel.component';
import { LoadingService } from '../../../core/services/loading.service';
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private breakpointObserver = inject(BreakpointObserver);
  public loadingService = inject(LoadingService); 

  sidebarTitle: string = '';

  userRole$: Observable<string | null> = this.store.select(selectUserRole);
  isAccountRoute: boolean = false;
  currentMenuItems: MenuItem[] = [];
  
  @ViewChild('drawer') drawer!: MatSidenav;
  isSidebarOpened: boolean = true;

  @ViewChild('wishlistPanel') wishlistPanel!: SidePanelComponent;
  @ViewChild('cartPanel') cartPanel!: SidePanelComponent;
  @ViewChild('notificationPanel') notificationPanel!: SidePanelComponent;

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

  isMobile$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result: { matches: boolean }) => result.matches),
      shareReplay(),
    );

  toggleDrawer(): void {
    this.isSidebarOpened = !this.isSidebarOpened;
  }

  ngOnInit(): void {
    // Initial load par check karo
    this.checkAccountRoute(this.router.url);

    // Router events ko track karo
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        this.checkAccountRoute(event.urlAfterRedirects);
      });

    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.isSidebarOpened = !result.matches;
    });
  }

  private checkAccountRoute(url: string): void {
    this.isAccountRoute = url.includes('/account');
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