import { Component, inject, OnInit } from '@angular/core';
import {
  AdminOrderFilterParams,
  AdminOrderItem,
  LegacyAdminOrderFilterParams,
  OrderListField,
  OrderStatus,
  PaymentStatus
} from '../../../../core/models/order.model';
import { DropdownOptions, TableColumn } from '../../../../core/models/table.model';
import { OrderHistoryService } from '../../../../core/services/order-history.service';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import {
  normalizeOrderStatus,
  normalizePaymentStatus
} from '../../../../core/utils/role.utils';
import { FormControl, FormGroup } from '@angular/forms';
import { getOrderStatusClass, getPaymentStatusClass } from '../../../../shared/utils/status-badge.utils';
import { Range } from '../../../../shared/components/multiselect-dropdown/multiselect-dropdown.component';


@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css']
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
    search: new FormControl('')
  });

  // Pagination State
  totalRecords: number = 0;
  pageSize: number = 15;
  pageIndex: number = 0;

  // Filter State
  // Dropdown Options
  orderStatusOptions: DropdownOptions[] = [
    { id: OrderStatus.Active, label: 'Active' },
    { id: OrderStatus.Shipped, label: 'Shipped' },
    { id: OrderStatus.Delivered, label: 'Delivered' },
    { id: OrderStatus.Cancelled, label: 'Cancelled' }
  ];

  paymentStatusOptions: DropdownOptions[] = [
    { id: PaymentStatus.Pending, label: 'Pending' },
    { id: PaymentStatus.Success, label: 'Success' },
    { id: PaymentStatus.Refunded, label: 'Refunded' },
    { id: PaymentStatus.Cancelled, label: 'Cancelled' }
  ];

  private destroy$ = new Subject<void>();
  private orderLoadRequests$ = new Subject<void>();
  dropdownLoadingMap: Record<string, boolean> = {};
  filterResetToken = 0;
  selectedRangesMap: Record<string, Range> = {};
  columnFilters: Record<string, string> = {};
  selectedOrderDate: string | undefined = undefined;
  private selectedMonth: number | undefined;
  private selectedYear: number | undefined;

  // Header Filter State Maps
  dropdownOptionsMap: Record<string, DropdownOptions[]> = {
    orderStatus: this.orderStatusOptions,
    paymentStatus: this.paymentStatusOptions
  };

  selectedFiltersMap: Record<string, (string | number)[]> = {
    orderStatus: [],
    paymentStatus: [],
  };

  rangeBoundsMap: Record<string, Range> = {
    totalAmount: {
      min: 0,
      max: 0
    }
  };

  // Table Columns Setup
  columns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID', truncate: true, filterable: true, filterType: 'search', clickable: true },
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
    }
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
              })
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
          paymentStatusClass: this.getPaymentStatusClass(item.paymentStatus)
        }));
        if (
          typeof response.minOrderAmount === 'number' &&
          typeof response.maxOrderAmount === 'number'
        ) {
          this.rangeBoundsMap = {
            ...this.rangeBoundsMap,
            totalAmount: {
              min: response.minOrderAmount,
              max: response.maxOrderAmount,
            },
          };
        }
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
        const searchValue = this.getQueryString(params['search']) ?? '';
        if (searchValue !== this.filterForm.get('search')?.value) {
          this.filterForm.patchValue(
            { search: searchValue },
            { emitEvent: false }
          );
        }

        const orderStatus = this.parseOrderStatus(params['orderStatus']);
        const paymentStatus = this.parsePaymentStatus(params['paymentStatus']);
        this.selectedFiltersMap = {
          ...this.selectedFiltersMap,
          orderStatus: orderStatus === undefined ? [] : [orderStatus],
          paymentStatus: paymentStatus === undefined ? [] : [paymentStatus],
        };
        this.selectedMonth = this.parseQueryNumber(params['month']);
        this.selectedYear = this.parseQueryNumber(params['year']);
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

  private getFilterParams(): LegacyAdminOrderFilterParams {
    const searchField = this.getActiveSearchField();
    const columnSearch = this.getActiveColumnSearch();
    const search = columnSearch?.term || this.searchQuery.trim() || undefined;
    const selectedStatuses = this.getSelectedOrderStatuses();
    const selectedPaymentStatuses = this.getSelectedPaymentStatuses();
    const selectedAmountRange = this.selectedRangesMap['totalAmount'];

    return {
      search: search,
      searchField: searchField,
      orderStatus: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      paymentStatus:
        selectedPaymentStatuses.length > 0
          ? selectedPaymentStatuses
          : undefined,
      orderDate: this.selectedOrderDate,
      minOrderAmount: selectedAmountRange?.min,
      maxOrderAmount: selectedAmountRange?.max,
      month: this.selectedMonth,
      year: this.selectedYear,
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    };
  }

  private getQueryString(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }
    return undefined;
  }

  private parseQueryNumber(value: unknown): number | undefined {
    const queryValue = this.getQueryString(value);
    if (!queryValue || !/^\d+$/.test(queryValue)) {
      return undefined;
    }
    const parsedValue = parseInt(queryValue, 10);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  private parseOrderStatus(value: unknown): OrderStatus | undefined {
    const parsedValue = this.parseQueryNumber(value);
    if (parsedValue === undefined) {
      return undefined;
    }
    switch (parsedValue) {
      case OrderStatus.Active:
      case OrderStatus.Shipped:
      case OrderStatus.Delivered:
      case OrderStatus.Cancelled:
        return parsedValue;
      default:
        return undefined;
    }
  }

  private parsePaymentStatus(value: unknown): PaymentStatus | undefined {
    const parsedValue = this.parseQueryNumber(value);
    if (parsedValue === undefined) {
      return undefined;
    }
    switch (parsedValue) {
      case PaymentStatus.Pending:
      case PaymentStatus.Success:
      case PaymentStatus.Refunded:
      case PaymentStatus.Cancelled:
        return parsedValue;
      default:
        return undefined;
    }
  }

  private getActiveColumnSearch(): { term: string; field: OrderListField } | undefined {
    if (this.columnFilters['orderId']?.trim()) {
      return {
        term: this.columnFilters['orderId'].trim(),
        field: OrderListField.OrderId
      };
    }
    if (this.columnFilters['customerName']?.trim()) {
      return {
        term: this.columnFilters['customerName'].trim(),
        field: OrderListField.CustomerName
      };
    }
    if (this.columnFilters['totalItems']?.trim()) {
      return {
        term: this.columnFilters['totalItems'].trim(),
        field: OrderListField.Items
      };
    }
    return undefined;
  }

  private getActiveSearchField(): OrderListField | undefined {
    return this.getActiveColumnSearch()?.field;
  }

  private getSelectedOrderStatuses(): OrderStatus[] {
    const selectedValues = this.selectedFiltersMap['orderStatus'] ?? [];
    return selectedValues.filter(
      (value): value is OrderStatus => typeof value === 'number'
    );
  }

  private getSelectedPaymentStatuses(): PaymentStatus[] {
    const selectedValues = this.selectedFiltersMap['paymentStatus'] ?? [];
    return selectedValues.filter(
      (value): value is PaymentStatus => typeof value === 'number'
    );
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

  onFilterApply(_event: { columnKey: string }): void {
    this.pageIndex = 0;
    this.loadOrders();
  }

  onFilterClear(columnKey: string): void {
    if (columnKey === 'totalAmount') {
      const selectedRanges = { ...this.selectedRangesMap };
      delete selectedRanges[columnKey];
      this.selectedRangesMap = selectedRanges;
    } else if (columnKey === 'orderStatus' || columnKey === 'paymentStatus') {
      this.selectedFiltersMap = {
        ...this.selectedFiltersMap,
        [columnKey]: []
      };
    }
    this.pageIndex = 0;
    this.loadOrders();
  }

  onDropdownSelectionChanged(event: {
    columnKey: string;
    option: DropdownOptions;
  }): void {
    if (event.columnKey !== 'orderStatus' && event.columnKey !== 'paymentStatus') {
      return;
    }

    const selectedValues = [...(this.selectedFiltersMap[event.columnKey] ?? [])];
    const selectedIndex = selectedValues.indexOf(event.option.id);
    if (selectedIndex >= 0) {
      selectedValues.splice(selectedIndex, 1);
    } else {
      selectedValues.push(event.option.id);
    }
    this.selectedFiltersMap = {
      ...this.selectedFiltersMap,
      [event.columnKey]: selectedValues
    };
  }

  onRangeFilterChanged(range: { columnKey: string; min: number; max: number }): void {
    if (range.columnKey !== 'totalAmount') {
      return;
    }
    this.selectedRangesMap = {
      ...this.selectedRangesMap,
      totalAmount: { min: range.min, max: range.max }
    };
  }

  onDateFilterChanged(event: {
    columnKey: string;
    formattedDate: string | null;
  }): void {
    if (event.columnKey !== 'orderDate') {
      return;
    }
    this.selectedOrderDate = event.formattedDate ?? undefined;
    this.pageIndex = 0;
    this.loadOrders();
  }

  onTableFilterChanged(filters: Record<string, string>): void {
    this.columnFilters = { ...filters };
    this.pageIndex = 0;
    this.loadOrders();
  }

  resetFilters(): void {
    this.filterForm.patchValue({ search: '' }, { emitEvent: false });
    this.selectedFiltersMap = {
      orderStatus: [],
      paymentStatus: []
    };
    this.selectedRangesMap = {};
    this.columnFilters = {};
    this.selectedOrderDate = undefined;
    this.selectedMonth = undefined;
    this.selectedYear = undefined;
    this.filterResetToken++;
    this.pageIndex = 0;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: null,
        orderStatus: null,
        paymentStatus: null,
        month: null,
        year: null
      },
      queryParamsHandling: 'merge'
    });
  }

  navigateToOrderDetails(row: Record<string, unknown>): void {
    const orderId = row['orderId'];
    if (typeof orderId === 'string' && orderId !== '') {
      this.router.navigate(
        this.portalRoutes.orders(this.portal, 'details', orderId)
      );
    } else if (typeof orderId === 'number' && Number.isFinite(orderId)) {
      this.router.navigate(
        this.portalRoutes.orders(this.portal, 'details', orderId.toString())
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
