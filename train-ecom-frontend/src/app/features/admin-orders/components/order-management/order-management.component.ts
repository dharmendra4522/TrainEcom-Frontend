import { Component } from '@angular/core';
import { OrderListItem } from '../../../../core/models/order.model';
import { TableColumn } from '../../../../core/models/table.model';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent {


  orders: OrderListItem[] = [];

  columns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'orderDate', label: 'Date' },
    { key: 'totalItems', label: 'Items' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'orderStatus', label: 'Status', type: 'badge' },
    { key: 'paymentStatus', label: 'Payment', type: 'badge' },
  ];
}
