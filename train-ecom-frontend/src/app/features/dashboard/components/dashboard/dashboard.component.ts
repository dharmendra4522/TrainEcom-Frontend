import { Component, OnInit } from '@angular/core';
import {
  OrderListItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../../core/models/order.model';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { TableColumn } from '../../../../core/models/table.model';
import { DashboardData } from '../../../../core/models/dashboard.model';

type DashboardOrderRow = {
  [key: string]: unknown;
  orderId: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  orderStatusClass: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentStatusClass: string;
  totalItems: number;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  stats = [
    { title: 'Total Revenue', value: '₹...', icon: 'attach_money', color: '#4caf50' },
    { title: 'Orders', value: '...', icon: 'shopping_cart', color: '#2196f3' },
    { title: 'Customers', value: '...', icon: 'people', color: '#ff9800' },
    { title: 'Products', value: '...', icon: 'inventory_2', color: '#f44336' },
    { title: 'Brands', value: '...', icon: 'branding_watermark', color: '#9c27b0' },
    { title: 'Categories', value: '...', icon: 'category', color: '#3f51b5' },
  ];

  recentOrders: DashboardOrderRow[] = [];
  tableColumns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'orderDate', label: 'Date' },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
    { key: 'paymentStatus', label: 'Payment Status', type: 'badge', badgeClassKey: 'paymentStatusClass' },
    { key: 'orderStatus', label: 'Order Status', type: 'badge', badgeClassKey: 'orderStatusClass' },
  ];
  dataSource = this.recentOrders;
  isLoadingStats = true;

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.fetchDashboardData();
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
      }
    });
  }

  private updateStatsCards(data: DashboardData): void {
    this.stats = [
      { title: 'Total Revenue', value: `₹${data.totalRevenue}`, icon: 'attach_money', color: '#4caf50' },
      { title: 'Orders', value: data.totalOrders.toString(), icon: 'shopping_cart', color: '#2196f3' },
      { title: 'Customers', value: data.totalUsers.toString(), icon: 'people', color: '#ff9800' },
      { title: 'Products', value: data.totalProducts.toString(), icon: 'inventory_2', color: '#f44336' },
      { title: 'Brands', value: data.totalBrands.toString(), icon: 'branding_watermark', color: '#9c27b0' },
      { title: 'Categories', value: data.totalCategories.toString(), icon: 'category', color: '#3f51b5' },
    ];
  }

  private updateRecentOrders(orders: any[]): void {
    this.recentOrders = orders.map(order => this.mapOrderToTableRow(order));
    this.dataSource = this.recentOrders;
  }

  private mapOrderToTableRow(order: any): DashboardOrderRow {
    return {
      orderId: order.orderId,
      orderDate: order.orderDate,
      totalAmount: order.totalPrice,
      orderStatus: order.orderStatus as OrderStatus,
      orderStatusClass: this.getOrdertatusClass(order.orderStatus),
      paymentMethod: PaymentMethod.Card,
      paymentStatus: PaymentStatus.Success,
      paymentStatusClass: this.getPaymentStatusClass(PaymentStatus.Success),
      totalItems: 1
    };
  }

  getOrdertatusClass(orderStatus: string): string {
    switch (orderStatus?.toLowerCase()) {
      case 'confirmed':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'processing':
        return 'bg-warning-subtle text-warning border border-warning-subtle';
      case 'shipped':
        return 'bg-info-subtle text-info border border-info-subtle';
      case 'delivered':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'cancelled':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'pending':
      default:
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  }

  getPaymentStatusClass(paymentStatus: string): string {
    switch (paymentStatus?.toLowerCase()) {
      case 'success':
      case 'paid':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'failed':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'pending':
      default:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
    }
  }

  navigateToOrders(): void{
    this.router.navigate(['/orders/manage']);
  }

}
