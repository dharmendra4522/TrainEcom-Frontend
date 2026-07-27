import { Component } from '@angular/core';
import { OrderListItem, OrderStatus, PaymentMethod, PaymentStatus } from '../../../../core/models/order.model';

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

recentOrders: OrderListItem[] = [
  {
    orderId: '#ORD-1001',
    orderDate: '12 Jul 2026',
    totalAmount: 120.5,
    orderStatus: 'Delivered' as OrderStatus,
    paymentMethod: PaymentMethod.UPI,
    paymentStatus: PaymentStatus.Success,
    totalItems: 3,
  },
  {
    orderId: '#ORD-1002',
    orderDate: '11 Jul 2026',
    totalAmount: 45,
    orderStatus: 'Pending' as OrderStatus,
    paymentMethod: PaymentMethod.CashOnDelivery,
    paymentStatus: PaymentStatus.Pending,
    totalItems: 1,
  },
  {
    orderId: '#ORD-1003',
    orderDate: '10 Jul 2026',
    totalAmount: 250,
    orderStatus: 'Shipped' as OrderStatus,
    paymentMethod: PaymentMethod.Card,
    paymentStatus: PaymentStatus.Success,
    totalItems: 5,
  },
  {
    orderId: '#ORD-1004',
    orderDate: '09 Jul 2026',
    totalAmount: 89.99,
    orderStatus: 'Processing' as OrderStatus,
    paymentMethod: PaymentMethod.UPI,
    paymentStatus: PaymentStatus.Pending,
    totalItems: 2,
  },
  {
    orderId: '#ORD-1005',
    orderDate: '08 Jul 2026',
    totalAmount: 320,
    orderStatus: 'Cancelled' as OrderStatus,
    paymentMethod: PaymentMethod.Card,
    paymentStatus: PaymentStatus.Failed,
    totalItems: 4,
  },
];

  displayedColumns: string[] = ['orderId', 'orderDate', 'totalAmount', 'orderStatus'];
  dataSource = this.recentOrders;
}
