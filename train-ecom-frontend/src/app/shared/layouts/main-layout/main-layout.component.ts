import { Component, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from '../../../core/models/menu-item.model';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../core/store/auth/auth.selectors';
import { NavigationEnd, Router } from '@angular/router';
import { filter, takeUntil, shareReplay, map } from 'rxjs/operators';
import { Subject, Observable, combineLatest } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { SidePanelComponent } from '../../components/side-panel/side-panel.component';
import { LoadingService } from '../../../core/services/loading.service';
import { getRoleMenuItems } from '../../../core/config/role-permission.config';
import { Role } from '../../../core/models/auth.model';
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
  isVendorRoute: boolean = false;
  isAdminRoute: boolean = false;
  isDetailsOrFormRoute: boolean = false;
  isCheckoutRoute: boolean = false;
  // currentMenuItems: MenuItem[] = [];

  @ViewChild('drawer') drawer!: MatSidenav;
  isSidebarOpened: boolean = true;

  @ViewChild('wishlistPanel') wishlistPanel!: SidePanelComponent;
  @ViewChild('cartPanel') cartPanel!: SidePanelComponent;
  @ViewChild('notificationPanel') notificationPanel!: SidePanelComponent;

  menuItems$: Observable<MenuItem[]> = combineLatest([this.userRole$]).pipe(
    map(([role]) => {
      const vendorStatus = localStorage.getItem('vendorStatus') || 'Pending';
      return getRoleMenuItems(role as Role | null, vendorStatus);
    }),
  );

  // adminMenuItems: MenuItem[] = [
  //   { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  //   { label: 'Products', icon: 'inventory_2', route: '/admin/products' },
  //   { label: 'Brands', icon: 'branding_watermark', route: '/admin/brands' },
  //   { label: 'Categories', icon: 'category', route: '/admin/categories' },
  //   { label: 'Manage Users', icon: 'people', route: '/admin/users' },
  //   { label: 'Manage Vendors', icon: 'store', route: '/admin/users/vendors' },
  //   { label: 'Manage Orders', icon: 'shopping_cart', route: '/admin/orders' },
  //   { label: 'Platform Analytics', icon: 'bar_chart', route: '/admin/reports' },
  //   {
  //     label: 'Notifications',
  //     icon: 'notifications',
  //     route: '/admin/notifications-history',
  //   },
  // ];

  // consumerMenuItems: MenuItem[] = [
  //   { label: 'My Profile', icon: 'person', route: '/account/profile' },
  //   { label: 'My Addresses', icon: 'location_on', route: '/account/address' },
  //   { label: 'My Wishlists', icon: 'favorite', route: '/account/wishlist' },
  //   { label: 'My Cart', icon: 'shopping_cart', route: '/account/cart' },
  //   { label: 'My Orders', icon: 'shopping_bag', route: '/account/orders' },
  //   {
  //     label: 'My Notifications',
  //     icon: 'notifications',
  //     route: '/account/notifications-history',
  //   },
  // ];

  // vendorMenuItems: MenuItem[] = [
  //   { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  //   { label: 'Products', icon: 'inventory_2', route: '/admin/products' },
  //   { label: 'Manage Orders', icon: 'shopping_cart', route: '/admin/orders' },
  //   { label: 'My Profile', icon: 'person', route: '/account/profile' },
  // ];

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
    this.checkAccountRoute(this.router.url);
    this.checkDetailsRoute(this.router.url);
    this.checkCheckoutRoute(this.router.url);

    // Router events ko track karo
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        this.checkAccountRoute(event.urlAfterRedirects);
        this.checkDetailsRoute(event.urlAfterRedirects);
        this.checkCheckoutRoute(event.urlAfterRedirects);

        setTimeout(() => {
          const scrollContainers = document.querySelectorAll(
            'mat-sidenav-content, .mat-mdc-sidenav-content, .mat-drawer-content',
          );
          scrollContainers.forEach((container) => {
            container.scrollTo({ top: 0, behavior: 'instant' });
          });
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 0);
      });

    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.isSidebarOpened = !result.matches;
    });
  }

  private checkRouteTypes(url: string): void {
    this.isAdminRoute = url.includes('/admin');
    this.isVendorRoute = url.includes('/vendor');
    this.isAccountRoute =
      url.includes('/account') ||
      url.includes('/cart') ||
      url.includes('/checkout') ||
      url.includes('/orders');
    this.isCheckoutRoute = url.includes('/checkout');

    const basePath = url.split('?')[0];
    this.isDetailsOrFormRoute =
      basePath.includes('/products/') && basePath !== '/products';
  }

  // Private methods to check the current route
  private checkAccountRoute(url: string): void {
    this.isAccountRoute =
      url.includes('/account') ||
      url.includes('/cart') ||
      url.includes('/checkout') ||
      url.includes('/orders');
  }

  // Private method to check if the current route is a product details or form route
  private checkDetailsRoute(url: string): void {
    const basePath = url.split('?')[0];
    this.isDetailsOrFormRoute =
      basePath.includes('/products/') && basePath !== '/products';
  }

  // Private method to check if the current route is a checkout route
  private checkCheckoutRoute(url: string): void {
    this.isCheckoutRoute = url.includes('/checkout');
  }

  // Method to determine if the sidebar should be shown based on the user's role and current route
  shouldShowSidebar(role: string | null): boolean {
    if (this.isCheckoutRoute) return false;
    if (role === 'Admin' || role === Role.Admin) return true;
    if (role === 'Vendor' || role === Role.Vendor) return true;
    if (role === 'Customer' && this.isAccountRoute) return true;
    return false;
  }

  // sidebar title
  getSidebarTitle(role: string | null): string {
    if (role === Role.Admin || role === 'Admin') return 'Admin Panel';
    if (role === Role.Vendor || role === 'Vendor') return 'Vendor Portal';
    return 'Manage My Account';
  }

  getSidebarType(role: string | null): string {
    if (role === Role.Admin || role === 'Admin') return 'admin';
    if (role === Role.Vendor || role === 'Vendor') return 'vendor';
    return 'customer';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
