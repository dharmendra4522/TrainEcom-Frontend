import { Component } from '@angular/core';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  stats = [
    {
      title: 'Total Revenue',
      value: '$5,420',
      icon: 'attach_money',
      color: '#4caf50',
    },
    { title: 'Orders', value: '128', icon: 'shopping_cart', color: '#2196f3' },
    { title: 'Customers', value: '850', icon: 'people', color: '#ff9800' },
    { title: 'Products', value: '45', icon: 'inventory_2', color: '#f44336' },
  ];

  recentOrders: Order[] = [
    {
      id: '#ORD-1001',
      customer: 'Rahul Sharma',
      date: '12 Jul 2026',
      total: '$120.50',
      status: 'Delivered',
    },
    {
      id: '#ORD-1002',
      customer: 'Priya Singh',
      date: '11 Jul 2026',
      total: '$45.00',
      status: 'Pending',
    },
    {
      id: '#ORD-1003',
      customer: 'Amit Kumar',
      date: '10 Jul 2026',
      total: '$250.00',
      status: 'Shipped',
    },
    {
      id: '#ORD-1004',
      customer: 'Neha Gupta',
      date: '09 Jul 2026',
      total: '$89.99',
      status: 'Processing',
    },
  ];

  displayedColumns: string[] = ['id', 'customer', 'date', 'total', 'status'];
  dataSource = this.recentOrders;
}
