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
  categoryProductData,
  getOrderStatusBadgeClass,
  getPaymentStatusBadgeClass,
  INITIAL_ADMIN_STATS,
  orderStatusChartData,
  revenueChartData,
  userChartData,
} from './dashboard.utils';
import { ApprovalStatus } from '../../../../core/models/user.model';
import {
  normalizeApprovalStatus,
  normalizeOrderStatus,
} from '../../../../core/utils/role.utils';
import { OrderStatus } from '../../../../core/models/order.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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
  public totalVendors: number = 0;
  public totalOrders: number = 0;
  public activeOrders: number = 0;
  public deliveredOrders: number = 0;
  public cancelOrders: number = 0

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
  public portal: PortalKey = 'admin';
  public isVendor: boolean = false;
  public userChartsType: ChartType = 'pie';
  public userChartData: ChartData<'pie'> = userChartData;

  // product bar
  public productChartType: ChartType = 'bar';
  // public isCategoryView: boolean = true;
  public productChartData: ChartData<'bar'> = categoryProductData;

  // revenue chart
  public revenueChartType: ChartType = 'bar';
  public revenueChartData: ChartData<'bar'> = revenueChartData;
  public revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  public orderChartType: ChartType = 'pie';
  public orderChartData: ChartData<'pie'> = orderStatusChartData;
  public orderChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };


  public userChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  public productChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    Chart.register(...registerables);

    this.portal = this.portalRoutes.currentPortal() ?? 'admin';

    if (this.portal === 'vendor') {
      // this.isVendor = false;
      this.isLoadingStats = false;
      this.stats = [];
      if (this.checkVendorPending()) {
        this.isApproved = false;
        this.isLoadingStats = false;
        return;
      }

    } else {
      // for Admin
      this.isApproved = true;
      this.fetchDashboardData();
    }
  }

  private checkVendorPending(): boolean {
    const vendorStatus = localStorage.getItem('vendorStatus');
    const status = normalizeApprovalStatus(vendorStatus);
    return status !== ApprovalStatus.Approved;
  }

  private fetchDashboardData(): void {
    this.isLoadingStats = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.updateStatsCards(data);
        this.updateRecentOrders(data.recentOrders);
        this.totalUsers = data.totalUsers;
        this.totalCustomers = data.totalCustomers;
        this.totalVendors = data.totalVendors;
        this.totalOrders = data.totalOrders;
        this.activeOrders = data.activeOrders;
        this.deliveredOrders = data.deliveredOrders;
        this.cancelOrders = data.cancelOrders;
        this.userChartData = {
          labels: ['Customers', 'Vendors'],
          datasets: [
            {
              data: [data.totalCustomers, data.totalVendors],
              backgroundColor: ['#4caf50', '#2196f3'],
            },
          ],
        }
        this.orderChartData = {
          labels: ['Active', 'Delivered', 'Cancelled'],
          datasets: [
            {
              data: [data.activeOrders, data.deliveredOrders, data.cancelOrders],
              backgroundColor: ['#2196f3', '#4caf50', '#f44336'],
            },
          ],
        };
        this.isLoadingStats = false;
      },
      error: (err: Error) => {
        console.error('Failed to fetch dashboard data', err);
        this.isLoadingStats = false;
      },
    });
  }

  private updateStatsCards(data: DashboardData): void {
    if (this.portal === 'vendor') {
      this.stats = [];
      return;
    }
    this.stats = buildDashboardStats(data, this.portalRoutes, this.portal);
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
      orderStatus: normalizeOrderStatus(order.orderStatus),
      orderStatusClass: getOrderStatusBadgeClass(order.orderStatus),
    };
  }

  getOrderStatusClass(orderStatus: OrderStatus | number | string): string {
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

  onStatCardClick(route?: (string | number)[]): void {
    if (route && route.length > 0) {
      this.router.navigate(route);
    }
  }
}
