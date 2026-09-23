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
import { Role, normalizeRole } from '../../../core/models/auth.model';
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

  userRole$: Observable<string | number | null> = this.store.select(selectUserRole);

  // Computed boolean role observables — used in template instead of string comparisons 
  isAdminRole$: Observable<boolean> = this.userRole$.pipe(
    map((role) => normalizeRole(role as string | number | null | undefined) === Role.Admin),
  );
  isVendorRole$: Observable<boolean> = this.userRole$.pipe(
    map((role) => normalizeRole(role as string | number | null | undefined) === Role.Vendor),
  );
  isCustomerRole$: Observable<boolean> = this.userRole$.pipe(
    map((role) => normalizeRole(role as string | number | null | undefined) === Role.Customer),
  );
  // True when user is Admin or Vendor — hides footer & search bar 
  isManagementRole$: Observable<boolean> = combineLatest([this.isAdminRole$, this.isVendorRole$]).pipe(
    map(([isAdmin, isVendor]) => isAdmin || isVendor),
  );

  isAccountRoute: boolean = false;
  isVendorRoute: boolean = false;
  isAdminRoute: boolean = false;
  isDetailsOrFormRoute: boolean = false;
  isCheckoutRoute: boolean = false;

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
  shouldShowSidebar(role: string | number | null): boolean {
    const normalizedRole = normalizeRole(role as string | number | null | undefined);
    if (this.isCheckoutRoute) return false;
    if (normalizedRole === Role.Admin) return true;
    if (normalizedRole === Role.Vendor) return true;
    if (normalizedRole === Role.Customer && this.isAccountRoute) return true;
    return false;
  }

  getSidebarType(role: string | number | null): string {
    const normalizedRole = normalizeRole(role as string | number | null | undefined);
    if (normalizedRole === Role.Admin) return 'admin';
    if (normalizedRole === Role.Vendor) return 'vendor';
    return 'customer';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
