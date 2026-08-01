import { Component, OnInit } from '@angular/core';
import {
  OrderListItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../../core/models/order.model';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Router } from '@angular/router';

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

  recentOrders: OrderListItem[] = [];
  displayedColumns: string[] = [
    'orderId',
    'orderDate',
    'totalAmount',
    'orderStatus',
  ];
  dataSource = this.recentOrders;

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.stats = [
          { title: 'Total Revenue', value: `₹${data.totalRevenue}`, icon: 'attach_money', color: '#4caf50' },
          { title: 'Orders', value: data.totalOrders.toString(), icon: 'shopping_cart', color: '#2196f3' },
          { title: 'Customers', value: data.totalUsers.toString(), icon: 'people', color: '#ff9800' },
          { title: 'Products', value: data.totalProducts.toString(), icon: 'inventory_2', color: '#f44336' },
          { title: 'Brands', value: data.totalBrands.toString(), icon: 'branding_watermark', color: '#9c27b0' },
          { title: 'Categories', value: data.totalCategories.toString(), icon: 'category', color: '#3f51b5' },
        ];

        this.recentOrders = data.recentOrders.map(order => ({
          orderId: order.orderId,
          orderDate: order.orderDate,
          totalAmount: order.totalPrice,
          orderStatus: order.orderStatus as OrderStatus,
          paymentMethod: PaymentMethod.Card,
          paymentStatus: PaymentStatus.Success,
          totalItems: 1
        }));
        this.dataSource = this.recentOrders;
      },
      error: (err) => {
        console.error('Failed to fetch dashboard data', err);
      }
    });
  }

  navigateToOrders(): void{
    this.router.navigate(['/orders/manage']);
  }

}
