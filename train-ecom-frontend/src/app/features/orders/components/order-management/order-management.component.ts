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
import { ActivatedRoute, Router } from '@angular/router';
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
  private route = inject(ActivatedRoute);

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
  selectedStatus: number | undefined = undefined;
  selectedPaymentStatus: number | undefined = undefined;
  fromDate: Date | string | null = '';
  toDate: Date | string | null = '';
  private appliedFromDate: Date | string | null = '';
  private appliedToDate: Date | string | null = '';

  maxDate: Date = new Date();

  // Dropdown Options
  orderStatusOptions = [
    { value: OrderStatus.Active, label: 'Active' },
    { value: OrderStatus.Shipped, label: 'Shipped' },
    { value: OrderStatus.Delivered, label: 'Delivered' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' }
  ];

  paymentStatusOptions = [
    { value: PaymentStatus.Pending, label: 'Pending' },
    { value: PaymentStatus.Success, label: 'Success' },
    { value: PaymentStatus.Refunded, label: 'Refunded' },
    { value: PaymentStatus.Cancelled, label: 'Cancelled' }
  ];

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
      badgeClassKey: 'orderStatusClass'
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      type: 'badge',
      badgeClassKey: 'paymentStatusClass'
    },
  ];

  ngOnInit(): void {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';
    this.setupUrlAndSearchListeners();
  }

  // handle URL query params and search input changes
  private setupUrlAndSearchListeners(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const statusParam = params['orderStatus'];
        this.selectedStatus = statusParam ? Number(statusParam) : undefined;

        const paymentParam = params['paymentStatus'];
        this.selectedPaymentStatus = paymentParam
          ? Number(paymentParam)
          : undefined;

        const searchParam = params['search'];
        if (
          searchParam !== undefined &&
          searchParam !== this.filterForm.get('search')?.value
        ) {
          this.filterForm.patchValue(
            { search: searchParam },
            { emitEvent: false }
          );
        }

        this.pageIndex = 0;
        this.loadOrders();
      });

    this.filterForm
      .get('search')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((searchValue) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { search: searchValue || null },
          queryParamsHandling: 'merge'
        });
      });
  }

  get searchQuery(): string {
    return this.filterForm.get('search')?.value || '';
  }

  private getFilterParams(): AdminOrderFilterParams {
    const formatToYyyyMmDd = (
      dateParam: Date | string | null
    ): string | undefined => {
      if (!dateParam) return undefined;
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) return undefined;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return {
      search: this.searchQuery ? this.searchQuery.trim() : undefined,
      orderStatus:
        this.selectedStatus !== undefined
          ? this.selectedStatus.toString()
          : undefined,
      paymentStatus:
        this.selectedPaymentStatus !== undefined
          ? this.selectedPaymentStatus.toString()
          : undefined,
      fromDate: formatToYyyyMmDd(this.appliedFromDate),
      toDate: formatToYyyyMmDd(this.appliedToDate),
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
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
            paymentStatusClass: this.getPaymentStatusClass(item.paymentStatus)
          }));
          this.orders = mappedOrders;
          this.totalRecords = response.totalRecords || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to fetch orders:', err);
          this.orders = [];
          this.isLoading = false;
        }
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        orderStatus:
          this.selectedStatus !== undefined ? this.selectedStatus : null,
        paymentStatus: this.selectedPaymentStatus !== undefined ? this.selectedPaymentStatus : null
      },
      queryParamsHandling: 'merge',
    });
  }

  applyDateFilter(): void {
    this.appliedFromDate = this.fromDate;
    this.appliedToDate = this.toDate;
    this.pageIndex = 0;
    this.loadOrders();
  }

  resetFilters(): void {
    this.filterForm.patchValue({ search: '' }, { emitEvent: false });
    this.selectedStatus = undefined;
    this.selectedPaymentStatus = undefined;
    this.fromDate = '';
    this.toDate = '';
    this.appliedFromDate = '';
    this.appliedToDate = '';
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
