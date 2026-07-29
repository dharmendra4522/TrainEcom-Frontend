import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { OrderListItem, OrderStatus } from '../../../../core/models/order.model';
import { TableColumn, TableAction, TableActionEvent } from '../../../../core/models/table.model';
import { Subject } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);
  private destroy$ = new Subject<void>();

  orders: OrderListItem[] = [];
  filteredOrders: OrderListItem[] = [];
  isLoading = false;

  searchControl = new FormControl('');
  pageIndex = 0;
  pageSize = 10;
  totalRecords = 0;

  columns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'orderDate', label: 'Date' },
    { key: 'totalItems', label: 'Items' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'orderStatus', label: 'Status', type: 'badge' },
    { key: 'paymentStatus', label: 'Payment', type: 'badge' },
  ];

  actions: TableAction[] = [
    {
      actionKey: 'view',
      icon: 'visibility',
      color: 'primary',
      tooltip: 'View Order',
    },
  ];

  ngOnInit(): void {
    this.loadOrders();

    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.applyFilter(query || '');
      });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (orders: OrderListItem[]) => {
        this.orders = orders;
        this.totalRecords = orders.length;
        this.applyFilter(this.searchControl.value || '');
      },
      error: (err) => {
        this.notification.showError('Failed to load orders. Please try again.', 'Close');
      },
    });
  }

  private applyFilter(query: string): void {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        (o) =>
          (o.orderId || '').toLowerCase().includes(q) ||
          (o.orderStatus || '').toLowerCase().includes(q) ||
          (o.paymentStatus || '').toLowerCase().includes(q)
      );
    }
    this.totalRecords = this.filteredOrders.length;
  }

  handleTableAction(event: TableActionEvent): void {
    const order = event.row as OrderListItem;
    if (event.action === 'view') {
      this.notification.showSuccess(`Viewing order: ${order.orderId}`, 'Close');
    }
  }

  handlePageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
