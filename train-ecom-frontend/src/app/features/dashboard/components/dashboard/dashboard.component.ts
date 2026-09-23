import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { TableColumn } from '../../../../core/models/table.model';
import {
  DashboardData,
  RecentOrder,
  DashboardOrderRow,
  DashboardStatItem,
} from '../../../../core/models/dashboard.model';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import {
  buildDashboardStats,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
  INITIAL_ADMIN_STATS,
} from './dashboard.utils';
import { ApprovalStatus, normalizeApprovalStatus } from '../../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  isVendorStatus: boolean = false;
  stats: DashboardStatItem[] = INITIAL_ADMIN_STATS;
  recentOrders: DashboardOrderRow[] = [];
  dataSource = this.recentOrders;
  isLoadingStats = true;

  tableColumns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID', truncate: true, type: 'string' },
    { key: 'customerName', label: 'Customer Name', type: 'string' },
    { key: 'orderDate', label: 'Date', type: 'date' },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
    {
      key: 'orderStatus',
      label: 'Order Status',
      type: 'string',
      badgeClassKey: 'orderStatusClass',
    },
  ];

  private portalRoutes = inject(PortalRouteService);
  private portal: PortalKey = 'admin';

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';
    if (this.checkVendorStatus()) {
      return;
    }
    this.isVendorStatus = true;
    this.fetchDashboardData();
  }

  private checkVendorStatus(): boolean {
    if (this.portal !== 'vendor') {
      return false; // Only vendors have a pending status screen
    }
    
    const vendorStatus = localStorage.getItem('vendorStatus');
    const status = normalizeApprovalStatus(vendorStatus);
    if (status !== ApprovalStatus.Approved) {
      this.isVendorStatus = false;
      this.isLoadingStats = false;
      this.stats = [];
      return true;
    }
    return false;
  }

  private fetchDashboardData(): void {
    this.isLoadingStats = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.updateStatsCards(data);
        this.updateRecentOrders(data.recentOrders);
        this.isLoadingStats = false;
      },
      error: (err: Error) => {
        console.error('Failed to fetch dashboard data', err);
        this.isLoadingStats = false;
      },
    });
  }

  private updateStatsCards(data: DashboardData): void {
    this.stats = buildDashboardStats(data);
  }

  private updateRecentOrders(orders: RecentOrder[]): void {
    this.recentOrders = orders.map((order) => this.mapOrderToTableRow(order));
    this.dataSource = [...this.recentOrders];
  }

  private mapOrderToTableRow(order: RecentOrder): DashboardOrderRow {
    return {
      orderId: order.orderId,
      customerName: order.customerName,
      orderDate: order.orderDate,
      totalAmount: order.totalPrice,
      orderStatus: order.orderStatus,
      orderStatusClass: getOrderStatusBadgeClass(order.orderStatus),
    };
  }

  getOrderStatusClass(orderStatus: string): string {
    return getOrderStatusBadgeClass(orderStatus);
  }

  onOrderClick(order: Record<string, unknown>): void {
    if (order && order['orderId']) {
      this.router.navigate(
        this.portalRoutes.orders(
          this.portal,
          'details',
          String(order['orderId']),
        ),
      );
    }
  }

  getPaymentStatusClass(paymentStatus: string): string {
    return getPaymentStatusBadgeClass(paymentStatus);
  }

  navigateToOrders(): void {
    this.router.navigate(this.portalRoutes.orders(this.portal, 'manage'));
  }
}
