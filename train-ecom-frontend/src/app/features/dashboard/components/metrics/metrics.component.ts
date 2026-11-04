import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DashboardStatItem } from '../../../../core/models/dashboard.model';
import { Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { Role } from '../../../../core/models/auth.model';
import { OrderStatus } from '../../../../core/models/checkout.model';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.css'
})
export class MetricsComponent {
  private router = inject(Router);
  private portalRoutes = inject(PortalRouteService);

  @Input() stats: DashboardStatItem[] = [];
  @Input() isLoadingStats: boolean = true;
  @Input() totalUsers: number = 0;
  @Input() totalCustomers: number = 0;
  @Input() totalVendors: number = 0;
  @Input() totalAdminUsers: number = 0;
  @Input() totalStaffUsers: number = 0;
  @Input() totalOrders: number = 0;
  @Input() activeOrders: number = 0;
  @Input() deliveredOrders: number = 0;
  @Input() cancelOrders: number = 0;
  @Input() shippedOrders: number = 0;
  @Input() portal: PortalKey = 'admin';

  @Output() statCardClick = new EventEmitter<(string | number)[] | undefined>();

  onCardClick(route?: (string | number)[]): void {
    if (route && route.length > 0) {
      this.statCardClick.emit(route);
    }
  }

  navigateToOrders(): void {
    this.router.navigate(this.portalRoutes.orders(this.portal, 'manage'));
  }
  navigateToUsers(): void {
    this.router.navigate(this.portalRoutes.users(this.portal, 'manage'));
  }

  navigateToCustomers(): void {
    this.router.navigate(this.portalRoutes.users(this.portal, 'manage'), {
      queryParams: { role: Role.Customer }
    });
  }

  navigateToVendors(): void {
    this.router.navigate(this.portalRoutes.users(this.portal, 'manage'), {
      queryParams: { role: Role.Vendor }
    });
  }

  navigateToActiveOrders(): void {
    this.router.navigate(this.portalRoutes.orders(this.portal, 'manage'), {
      queryParams: { orderStatus: OrderStatus.Active }
    });
  }

  navigateToDeliveredOrders(): void {
    this.router.navigate(this.portalRoutes.orders(this.portal, 'manage'), {
      queryParams: { orderStatus: OrderStatus.Delivered }
    });
  }

  navigateToCancelledOrders(): void {
    this.router.navigate(this.portalRoutes.orders(this.portal, 'manage'), {
      queryParams: { orderStatus: OrderStatus.Cancelled }
    });
  }

}
