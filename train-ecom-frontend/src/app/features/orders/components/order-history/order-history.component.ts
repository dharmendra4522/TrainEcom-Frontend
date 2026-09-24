import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { OrderHistoryFilterParams, OrderHistoryItem, OrderStatus } from '../../../../core/models/order.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { normalizeOrderStatus } from '../../../../core/utils/role.utils';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  private orderHistoryService = inject(OrderHistoryService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  orderHistory: OrderHistoryItem[] = [];
  isLoading = false;

  // Pagination State
  totalRecords = 0;
  pageSize = 6;
  pageIndex = 0; // MatPaginator is 0-indexed

  // Filters State
  searchQuery = '';
  // selectedStatus = '';
  fromDate = '';
  toDate = '';

  todayDate = new Date().toISOString().split('T')[0];

  selectedStatus: OrderStatus | '' = '';
  orderStatusOptions = Object.values(OrderStatus).filter(val => typeof val === 'number') as OrderStatus[];
  
  normalizeOrderStatus = normalizeOrderStatus;

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  setupSearchFilter(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchTerm) => {
      this.searchQuery = searchTerm;
      this.pageIndex = 0;
      this.loadOrderHistory();
    });
  }

  loadOrderHistory(): void {
    this.isLoading = true;

    const filter: OrderHistoryFilterParams = {
      orderStatus: this.selectedStatus !== '' ? (this.selectedStatus as OrderStatus) : undefined,
      fromDate: this.fromDate ? this.fromDate : undefined,
      toDate: this.toDate ? this.toDate : undefined,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
    };

    this.orderHistoryService.getAllOrderHistory(filter).subscribe({
      next: (response) => {
        this.orderHistory = response.items || [];
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

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

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

  getOrdertatusClass(orderStatus: OrderStatus | string | number): string {
    const statusStr = String(orderStatus).toLowerCase();
    switch (statusStr) {
      case 'confirmed':
      case '1':
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

  getImageUrl(url?: string | null): string {
    if (!url || url === 'null' || url.trim() === '') {
      return 'assets/images/placeholder.png';
    }
    return url;
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

  navigateToOrderDetails(orderId: string | number): void {
    this.router.navigate(['/account/orders/customer-details', orderId]);
  }

   get formattedOrderStatus(): string {
    return normalizeOrderStatus(this.selectedStatus);
  }

}
