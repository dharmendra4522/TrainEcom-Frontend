import { Component, OnInit, inject } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import {
  OrderHistoryFilterParams,
  OrderHistoryItem,
  OrderHistoryViewModel,
  OrderStatus
} from '../../../../core/models/order.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {
  normalizeOrderStatus,
  normalizePaymentStatus
} from '../../../../core/utils/role.utils';
import { getOrderStatusClass, getPaymentStatusClass } from '../../../../shared/utils/status-badge.utils';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  private orderHistoryService = inject(OrderHistoryService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  orderHistory: OrderHistoryViewModel[] = [];
  isLoading = false;

  // Pagination State
  totalRecords = 0;
  pageSize = 6;
  pageIndex = 0; // MatPaginator is 0-indexed

  // Filters State
  fromDate = '';
  toDate = '';
  todayDate = new Date().toISOString().split('T')[0];
  selectedStatus: OrderStatus | '' = '';
  orderStatusOptions = Object.values(OrderStatus)
    .filter(value => typeof value === 'number')
    .map(status => ({
      value: status as OrderStatus,
      label: normalizeOrderStatus(status as OrderStatus)
    }));


  ngOnInit(): void {
    this.loadOrderHistory();
  }

  // Fetches order history based on current filters and pagination state
  loadOrderHistory(): void {
    this.isLoading = true;
    const filter: OrderHistoryFilterParams = {
      orderStatus: this.selectedStatus !== '' ? this.selectedStatus : undefined,
      fromDate: this.fromDate ? this.fromDate : undefined,
      toDate: this.toDate ? this.toDate : undefined,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    };

    this.orderHistoryService.getAllOrderHistory(filter).subscribe({
      next: (response) => {
        this.orderHistory = this.mapOrderHistory(response.items || []);
        this.totalRecords = response.totalRecords || 0;
        this.isLoading = false;
      },
      error: () => {
        this.notification.showError('Failed to fetch order history. Please try again later.');
        this.orderHistory = [];
        this.isLoading = false;
      }
    });
  }

  // handle mapping of order history items to view model with additional properties
  private mapOrderHistory(items: OrderHistoryItem[]): OrderHistoryViewModel[] {
    return items.map(order => ({
      ...order,
      orderStatusLabel: normalizeOrderStatus(order.orderStatus),
      paymentStatusLabel:
        order.paymentStatus !== undefined
          ? normalizePaymentStatus(order.paymentStatus)
          : '',
      orderStatusClass: getOrderStatusClass(order.orderStatus),
      paymentStatusClass:
        order.paymentStatus !== undefined
          ? getPaymentStatusClass(order.paymentStatus)
          : '',
      imageUrl:
        !order.thumbnailUrl ||
          order.thumbnailUrl === 'null' ||
          order.thumbnailUrl.trim() === ''
          ? 'assets/images/placeholder.png'
          : order.thumbnailUrl
    }));
  }

  // handle filter changes and reload order history
  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadOrderHistory();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrderHistory();
  }

  resetFilters(): void {
    this.selectedStatus = '';
    this.fromDate = '';
    this.toDate = '';
    this.pageIndex = 0;
    this.loadOrderHistory();
  }

  applyDateFilter(): void {
    this.pageIndex = 0;
    this.loadOrderHistory();
  }

  onDateChange(type: 'from' | 'to', event: MatDatepickerInputEvent<Date>): void {
    const rawDate = event.value;
    if (rawDate) {
      const year = rawDate.getFullYear();
      const month = String(rawDate.getMonth() + 1).padStart(2, '0');
      const day = String(rawDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      if (type === 'from') {
        this.fromDate = formattedDate;
      } else {
        this.toDate = formattedDate;
      }
    } else {
      if (type === 'from') {
        this.fromDate = '';
      } else {
        this.toDate = '';
      }
    }
  }

  navigateToOrderDetails(orderId: number): void {
    this.router.navigate(['/account/orders/customer-details', orderId]);
  }

}
