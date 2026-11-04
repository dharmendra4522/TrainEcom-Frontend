import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { TableColumn } from '../../../../core/models/table.model';
import {
  DashboardData,
  RecentOrder,
  DashboardOrderRow,
  DashboardStatItem
} from '../../../../core/models/dashboard.model';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import {
  buildDashboardStats,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
  INITIAL_ADMIN_STATS
} from './dashboard.utils';
import { ApprovalStatus } from '../../../../core/models/user.model';
import {
  normalizeApprovalStatus,
  normalizeOrderStatus
} from '../../../../core/utils/role.utils';
import { OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  isApproved: boolean = true;
  stats: DashboardStatItem[] = INITIAL_ADMIN_STATS;
  recentOrders: DashboardOrderRow[] = [];
  dataSource = this.recentOrders;
  isLoadingStats: boolean = true;
  isHovered: boolean = false;

  public totalUsers: number = 0;
  public totalCustomers: number = 0;
  public totalAdminUsers: number = 0;
  public totalVendors: number = 0;
  public totalStaffUsers: number = 0;
  public totalOrders: number = 0;
  public activeOrders: number = 0;
  public deliveredOrders: number = 0;
  public shippedOrders: number = 0;
  public cancelOrders: number = 0;
  public processingOrders: number = 0;

  // order table columns
  tableColumns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID', truncate: true, type: 'string' },
    { key: 'customerName', label: 'Customer Name', type: 'string' },
    { key: 'orderDate', label: 'Date', type: 'date' },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
    {
      key: 'orderStatus',
      label: 'Order Status',
      type: 'badge',
      badgeClassKey: 'orderStatusClass'
    }
  ];

  private portalRoutes = inject(PortalRouteService);
  public portal: PortalKey = 'admin';
  public isVendor: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';

    if (this.portal === 'vendor') {
      this.isVendor = true;
      if (this.checkVendorPending()) {
        this.isApproved = false;
        this.isLoadingStats = false;
        return;
      }
      
      this.isApproved = true;
    }
    this.isApproved = true;
    this.fetchDashboardData();
  }

  private checkVendorPending(): boolean {
    const vendorStatus = localStorage.getItem('vendorStatus');
    const status = normalizeApprovalStatus(vendorStatus);
    return status !== ApprovalStatus.Approved;
  }

  private fetchDashboardData(): void {
    this.isLoadingStats = true;
    this.dashboardService.fetchDashboardMetricsData().subscribe({
      next: (data: DashboardData) => {
        this.updateStatsCards(data);
        this.updateRecentOrders(data.recentOrders);
        this.totalUsers = data.totalUsers;
        this.totalCustomers = data.totalCustomers;
        this.totalVendors = data.totalVendors;
        this.totalAdminUsers = data.totalAdminUsers;
        this.totalStaffUsers = data.totalStaffUsers ?? 0;
        this.shippedOrders = data.shippedOrders;
        this.totalOrders = data.totalOrders;
        this.activeOrders = data.activeOrders;
        this.deliveredOrders = data.deliveredOrders;
        this.cancelOrders = data.cancelOrders;
        this.isLoadingStats = false;
      },
      error: (err: Error) => {
        console.error('Failed to fetch dashboard data', err);
        this.isLoadingStats = false;
      }
    });
  }

  // Update the stats cards based on the fetched dashboard data
  private updateStatsCards(data: DashboardData): void {
    this.stats = buildDashboardStats(data, this.portalRoutes, this.portal);
  }

  // Update the recent orders table based on the fetched dashboard data
  private updateRecentOrders(orders: RecentOrder[]): void {
    this.recentOrders = orders.map((order) => this.mapOrderToTableRow(order));
    this.dataSource = [...this.recentOrders];
  }

  // Map a RecentOrder object to a DashboardOrderRow object for display in the table
  private mapOrderToTableRow(order: RecentOrder): DashboardOrderRow {
    return {
      orderId: order.orderId,
      customerName: order.customerName,
      orderDate: order.orderDate,
      totalAmount: order.totalPrice,
      orderStatus: normalizeOrderStatus(order.orderStatus),
      orderStatusClass: getOrderStatusBadgeClass(order.orderStatus)
    };
  }

  // Get the CSS class for the order status badge based on the order status
  getOrderStatusClass(orderStatus: OrderStatus | number | string): string {
    return getOrderStatusBadgeClass(orderStatus);
  }

  // Navigate to the order details page when an order row is clicked
  onOrderClick(order: Record<string, unknown>): void {
    if (order && order['orderId']) {
      this.router.navigate(
        this.portalRoutes.orders(
          this.portal,
          'details',
          String(order['orderId'])
        )
      );
    }
  }

  getPaymentStatusClass(paymentStatus: string): string {
    return getPaymentStatusBadgeClass(paymentStatus);
  }

  navigateToOrders(): void {
    this.router.navigate(this.portalRoutes.orders(this.portal, 'manage'));
  }

  onStatCardClick(route?: (string | number)[]): void {
    if (route && route.length > 0) {
      this.router.navigate(route);
    }
  }
}
