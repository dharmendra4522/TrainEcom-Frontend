import { Component, inject, OnInit } from '@angular/core';
import {
  AdminOrderFilterParams,
  AdminOrderItem,
  OrderStatus,
  PaymentStatus,
} from '../../../../core/models/order.model';
import { TableColumn } from '../../../../core/models/table.model';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import {
  normalizeOrderStatus,
  normalizePaymentStatus,
} from '../../../../core/utils/role.utils';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent implements OnInit {
  private orderService = inject(OrderHistoryService);
  private router = inject(Router);
  private portalRoutes = inject(PortalRouteService);

  portal: PortalKey = 'admin';

  orders: AdminOrderItem[] = [];
  isLoading: boolean = false;

  filterForm = new FormGroup({
    search: new FormControl(''),
  });

  // Pagination State
  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  // Filter State
  selectedStatus = '';
  selectedPaymentStatus = '';
  fromDate: Date | string | null = '';
  toDate: Date | string | null = '';

  maxDate: Date = new Date();

  // Dropdown Options
  orderStatusOptions = Object.values(OrderStatus).filter(
    (val) => typeof val === 'string',
  ) as string[];

  paymentStatusOptions = Object.values(PaymentStatus).filter(
    (val) => typeof val === 'string',
  ) as string[];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Table Columns Setup
  columns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID', truncate: true },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'orderDate', label: 'Date', type: 'date' },
    { key: 'totalItems', label: 'Items' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    {
      key: 'orderStatus',
      label: 'Status',
      type: 'badge',
      badgeClassKey: 'orderStatusClass',
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      type: 'badge',
      badgeClassKey: 'paymentStatusClass',
    },
  ];

  ngOnInit(): void {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';
    this.setupSearch();
    this.loadOrders();
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }

  private getFilterParams(): AdminOrderFilterParams {
    const formatToYyyyMmDd = (
      date: Date | string | null,
    ): string | undefined => {
      if (!date) return undefined;
      const d = new Date(date);
      if (isNaN(d.getTime())) return undefined;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return {
      search: this.searchQuery ? this.searchQuery.trim() : undefined,
      orderStatus: this.selectedStatus ? this.selectedStatus : undefined,
      paymentStatus: this.selectedPaymentStatus
        ? this.selectedPaymentStatus
        : undefined,
      fromDate: formatToYyyyMmDd(this.fromDate),
      toDate: formatToYyyyMmDd(this.toDate),
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
    };
  }

  // setup search
  private setupSearch(): void {
    this.filterForm
      .get('search')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          this.pageIndex = 0;
          this.isLoading = true;
          return this.orderService.getManagedOrders(
            this.portal,
            this.getFilterParams(),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          const mappedOrders = (response.items || []).map((item) => ({
            ...item,
            orderStatus: normalizeOrderStatus(item.orderStatus),
            paymentStatus: normalizePaymentStatus(item.paymentStatus),
            orderStatusClass: this.getOrderStatusClass(item.orderStatus),
            paymentStatusClass: this.getPaymentStatusClass(item.paymentStatus),
          }));
          this.orders = mappedOrders;
          this.totalRecords = response.totalRecords || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to fetch orders:', err);
          this.orders = [];
          this.isLoading = false;
        },
      });
  }

  // fetch orders
  loadOrders(): void {
    this.isLoading = true;

    this.orderService
      .getManagedOrders(this.portal, this.getFilterParams())
      .subscribe({
        next: (response) => {
          const mappedOrders = (response.items || []).map((item) => ({
            ...item,
            orderStatus: normalizeOrderStatus(item.orderStatus),
            paymentStatus: normalizePaymentStatus(item.paymentStatus),
            orderStatusClass: this.getOrderStatusClass(item.orderStatus),
            paymentStatusClass: this.getPaymentStatusClass(item.paymentStatus),
          }));

          if (this.pageIndex === 0) {
            this.orders = mappedOrders;
          } else {
            this.orders = [...this.orders, ...mappedOrders];
          }

          this.totalRecords = response.totalRecords || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to fetch orders:', error);
          this.orders = [];
          this.isLoading = false;
        },
      });
  }

  getOrderStatusClass(status: string): string {
    const statusStr = normalizeOrderStatus(status).toLowerCase();
    switch (statusStr?.toLowerCase()) {
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

  getPaymentStatusClass(status: string): string {
    const normalizeStatus = normalizePaymentStatus(status);
    switch (normalizeStatus?.toLowerCase()) {
      case 'success':
      case 'paid':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'failed':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'refunded':
        return 'bg-info-subtle text-info border border-info-subtle';
      case 'pending':
      default:
        return 'bg-warning-subtle text-warning border border-warning-subtle';
    }
  }

  onTableScroll(): void {
    if (!this.isLoading && this.orders.length < this.totalRecords) {
      this.pageIndex++;
      this.loadOrders();
    }
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadOrders();
  }

  applyDateFilter(): void {
    this.pageIndex = 0;
    this.loadOrders();
  }

  resetFilters(): void {
    this.filterForm.patchValue({ search: '' }, { emitEvent: false });
    this.selectedStatus = '';
    this.selectedPaymentStatus = '';
    this.fromDate = '';
    this.toDate = '';
    this.pageIndex = 0;
    this.loadOrders();
  }

  navigateToOrderDetails(row: Record<string, unknown>): void {
    const orderId = row['orderId'] as string;
    if (orderId) {
      this.router.navigate(
        this.portalRoutes.orders(this.portal, 'details', orderId),
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
