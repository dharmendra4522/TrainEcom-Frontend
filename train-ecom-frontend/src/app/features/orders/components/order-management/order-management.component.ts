import { Component, inject, OnInit } from '@angular/core';
import {
  AdminOrderFilterParams,
  AdminOrderItem,
  OrderStatus,
  PaymentStatus,
} from '../../../../core/models/order.model';
import { TableColumn } from '../../../../core/models/table.model';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import {
  normalizeOrderStatus,
  normalizePaymentStatus,
} from '../../../../core/utils/role.utils';
import { FormControl, FormGroup } from '@angular/forms';
import { getOrderStatusClass, getPaymentStatusClass } from '../../../../shared/utils/status-badge.utils';

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
  showFilterHeader: boolean = true;

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
  selectedMonth: number | undefined = undefined;
  selectedYear: number | undefined = undefined;
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
  private orderLoadRequests$ = new Subject<void>();

  // Table Columns Setup
  columns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID', truncate: true, filterable: true, filterType: 'search' },
    { key: 'customerName', label: 'Customer Name', filterable: true, filterType: 'search' },
    { key: 'orderDate', label: 'Date', type: 'date', filterable: true, filterType: 'date' },
    { key: 'totalItems', label: 'Items', filterable: true, filterType: 'search' },
    { key: 'totalAmount', label: 'Total', type: 'currency', filterable: true, filterType: 'price-range' },
    {
      key: 'orderStatus',
      label: 'Status',
      type: 'badge',
      badgeClassKey: 'orderStatusClass',
      filterable: true,
      filterType: 'dropdown'
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      type: 'badge',
      badgeClassKey: 'paymentStatusClass',
      filterable: true,
      filterType: 'dropdown'
    },
  ];

  ngOnInit(): void {
    this.portal = this.portalRoutes.currentPortal() ?? 'admin';
    this.setupOrderLoading();
    this.setupUrlAndSearchListeners();
  }

  private setupOrderLoading(): void {
    this.orderLoadRequests$
      .pipe(
        switchMap(() => {
          this.isLoading = true;
          return this.orderService
            .getManagedOrders(this.portal, this.getFilterParams())
            .pipe(
              catchError((error) => {
                console.error('Failed to fetch orders:', error);
                this.orders = [];
                this.isLoading = false;
                return EMPTY;
              }),
            );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((response) => {
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
      });
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

        const monthParam = params['month'];
        this.selectedMonth = monthParam ? monthParam : undefined;

        const yearParam = params['year'];
        this.selectedYear = yearParam ? yearParam : undefined;

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
      month: this.selectedMonth,
      year: this.selectedYear,
      fromDate: formatToYyyyMmDd(this.appliedFromDate),
      toDate: formatToYyyyMmDd(this.appliedToDate),
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    };
  }

  // fetch orders
  loadOrders(): void {
    this.orderLoadRequests$.next();
  }

  getOrderStatusClass(status: string): string {
    return getOrderStatusClass(status);
  }

  getPaymentStatusClass(status: string): string {
    return getPaymentStatusClass(status);
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
    this.selectedMonth = undefined;
    this.selectedYear = undefined;
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
