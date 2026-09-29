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
} from './dashboard.utils';
import { ApprovalStatus } from '../../../../core/models/user.model';
import {
  normalizeApprovalStatus,
  normalizeOrderStatus,
} from '../../../../core/utils/role.utils';
import { OrderStatus } from '../../../../core/models/order.model';
import { ChartConfiguration, ChartData, ChartType, Colors } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  isLoadingChartData: boolean = true;

  public totalUsers: number = 0;
  public totalCustomers: number = 0;
  public totalAdminUsers: number = 0;
  public totalVendors: number = 0;
  public totalOrders: number = 0;
  public activeOrders: number = 0;
  public deliveredOrders: number = 0;
  public shippedOrders: number = 0;
  public cancelOrders: number = 0
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
      badgeClassKey: 'orderStatusClass',
    },
  ];

  private portalRoutes = inject(PortalRouteService);
  public portal: PortalKey = 'admin';
  public isVendor: boolean = false;
  public userChartsType: ChartType = 'pie';
  public userChartData!: ChartData<'pie'>;

  // user chart configuration
  public userChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: window.innerWidth < 768 ? {
        top: 10,
        bottom: 20,
        left: 60,
        right: 70
      } : {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      datalabels: {
        color: '#000',
        formatter: (value, context) => {
          const label = context.chart.data.labels?.[context.dataIndex];
          return `${label}: ${value}`;
        },
        anchor: 'end',
        align: 'end',
        offset: 4,
        display: true,
        borderRadius: 4,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderWidth: 1,
        padding: 4,
      }
    },
  };

  // product bar
  public productChartType: ChartType = 'bar';
  public productChartData: ChartData<'bar'> = categoryProductData;

  // revenue chart
  public revenueChartType: ChartType = 'bar';
  public revenueChartData: ChartData<'bar'> = revenueChartData;
  public revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // order chart configuration
  public orderChartType: ChartType = 'bar';
  public orderChartData: ChartData<'bar'> = orderStatusChartData;
  public orderChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };




  // category chart configuration
  public productChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: false,
      }
    },
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
    Chart.register(...registerables, ChartDataLabels);

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
        this.totalAdminUsers = data.totalAdminUsers;
        this.shippedOrders = data.shippedOrders;
        this.totalOrders = data.totalOrders;
        this.activeOrders = data.activeOrders;
        this.deliveredOrders = data.deliveredOrders;
        this.cancelOrders = data.cancelOrders;
        this.userChartData = {
          labels: ['Customers', 'Vendors', 'Admin Users'],
          datasets: [
            {
              data: [data.totalCustomers, data.totalVendors, data.totalAdminUsers],
              backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
            },
          ],
        }
        this.isLoadingChartData = false;
        this.isLoadingStats = false;
      },
      error: (err: Error) => {
        console.error('Failed to fetch dashboard data', err);
        this.isLoadingStats = false;
        this.isLoadingChartData = false;
      },
    });
  }

  // Update the stats cards based on the fetched dashboard data
  private updateStatsCards(data: DashboardData): void {
    if (this.portal === 'vendor') {
      this.stats = [];
      return;
    }
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
      orderStatusClass: getOrderStatusBadgeClass(order.orderStatus),
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
