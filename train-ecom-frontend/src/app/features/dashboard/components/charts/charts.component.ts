import {
  CategoryWiseProductCount,
  OrderSummaryResponse,
  RevenueData,
} from './../../../../core/models/dashboard.model';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ChartData, ChartType, Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../../../../core/services/dashboard.service';
import {
  categoryProductData,
  orderStatusChartData,
  revenueChartData,
  userChartData,
} from '../dashboard/dashboard.utils';
import {
  getOrderChartOptions,
  getProductChartOptions,
  getUserChartOptions,
  orderChartOptions as orderChartConfiguration,
  revenueChartOptions as revenueChartConfiguration,
} from './charts.config';
import { MatDialog } from '@angular/material/dialog';
import {
  FilterDialogComponent,
  FilterDialogData,
  FilterDialogResult,
} from '../../../../shared/components/filter-dialog/filter-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private portalRoutes = inject(PortalRouteService);

  @Input() totalUsers: number = 0;
  @Input() totalCustomers: number = 0;
  @Input() totalVendors: number = 0;
  @Input() totalAdminUsers: number = 0;
  @Input() isVendor: boolean = false;
  @Input() isLoading: boolean = true;
  @Input() portal: PortalKey = 'admin';

  // State variables update karein
  public totalRevenue: number = 0;
  public totalOrders: number = 0;
  public totalCategories: number = 0;

  // Revenue Filter States
  public revenueFilterCount: number = 0;
  public selectedRevenueYear: number | null = null;
  public selectedRevenueVendorIds: number[] = [];

  // Order Filter States
  public orderFilterCount: number = 0;
  public selectedOrderYear: number | null = null;
  public selectedOrderVendorIds: number[] = [];

  public userChartsType: ChartType = 'pie';
  public userChartData!: ChartData<'pie'>;

  public userChartOptions = getUserChartOptions(
    this.router,
    this.portalRoutes,
    this.portal,
  );

  public productChartType: ChartType = 'bar';
  public productChartData: ChartData<'bar'> = categoryProductData;
  public productChartOptions = getProductChartOptions(
    this.router,
    this.portalRoutes,
  );

  // revenue chart configuration
  public revenueChartType: ChartType = 'bar';
  public revenueChartData: ChartData<'bar'> = revenueChartData;
  public revenueChartOptions = revenueChartConfiguration;

  // order chart configuration
  public orderChartType: ChartType = 'bar';
  public orderChartData: ChartData<'bar'> = orderStatusChartData;
  public get orderChartOptions() {
    return getOrderChartOptions(
      this.router,
      this.portalRoutes,
      this.portal,
      this.selectedOrderYear,
    );
  }

  ngOnInit(): void {
    Chart.register(...registerables, ChartDataLabels);
    this.initUserChart();
    this.fetchCategoryData();
    this.fetchRevenueData();
    this.fetchOrderSummaryData();
  }

  public ngOnChanges(): void {
    this.initUserChart();
  }

  // initialize user chart data based on the input values
  private initUserChart(): void {
    if (this.isVendor) {
      this.userChartData = userChartData;
      return;
    }

    this.userChartData = {
      labels: ['Customers', 'Vendors', 'Admin Users'],
      datasets: [
        {
          data: [this.totalCustomers, this.totalVendors, this.totalAdminUsers],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
        },
      ],
    };
  }

  // fetch category data for charts
  private fetchCategoryData(): void {
    if (this.isVendor) {
      return;
    }
    this.dashboardService.fetchCategoryWiseProductCount().subscribe({
      next: (data: CategoryWiseProductCount[]) => {
        this.totalCategories = 6;
        const labels = data.map((item) => item.categoryName);
        const counts = data.map((item) => item.productCount);
        this.productChartData = {
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: ['#2196f3'],
            },
          ],
        };
      },
      error: (err: Error) => {
        console.error('Failed to fetch category data', err);
      },
    });
  }

  // fetch revenue data for charts
  private fetchRevenueData(year?: number, vendorIds?: number[]): void {
    if (this.isVendor) {
      return;
    }
    this.dashboardService.fetchRevenueData(year, vendorIds).subscribe({
      next: (data: RevenueData) => {
        this.totalRevenue = data.totalRevenue;
        const labels = [...revenueChartData.labels];
        const revenues = labels.map(
          (_, monthIndex) =>
            data.monthlyRevenue.find((item) => item.month === monthIndex + 1)
              ?.revenue ?? 0,
        );

        this.revenueChartData = {
          labels: labels,
          datasets: [
            {
              data: revenues,
              backgroundColor: ['#4caf50'],
            }
          ]
        };
      },
      error: (err: Error) => {
        console.error('Failed to fetch revenue data', err);
      },
    });
  }

  // fetch order summary data for charts
  private fetchOrderSummaryData(year?: number, vendorIds?: number[]): void {
    if (this.isVendor) {
      return;
    }
    this.dashboardService.fetchOrderSummary(year, vendorIds).subscribe({
      next: (data: OrderSummaryResponse) => {
        this.totalOrders = data.totalOrders;
        const labels = [...orderStatusChartData.labels];

        // map the order summary data to the chart data
        const activeOrders = labels.map(
          (_, monthIndex) =>
            data.monthlyData.find((item) => item.month === monthIndex + 1)
              ?.activeOrders ?? 0
        );
        const deliveredOrders = labels.map(
          (_, monthIndex) =>
            data.monthlyData.find((item) => item.month === monthIndex + 1)
              ?.deliveredOrders ?? 0
        );
        const cancelOrders = labels.map(
          (_, monthIndex) =>
            data.monthlyData.find((item) => item.month === monthIndex + 1)
              ?.cancelOrders ?? 0
        );
        const shippedOrders = labels.map(
          (_, monthIndex) =>
            data.monthlyData.find((item) => item.month === monthIndex + 1)
              ?.shippedOrders ?? 0
        );

        this.orderChartData = {
          labels: labels,
          datasets: [
            {
              data: activeOrders,
              label: 'Active Orders',
              backgroundColor: '#2196f3'
            },
            {
              data: deliveredOrders,
              label: 'Delivered Orders',
              backgroundColor: '#4caf50'
            },
            {
              data: cancelOrders,
              label: 'Cancelled Orders',
              backgroundColor: '#f44336'
            },
            {
              data: shippedOrders,
              label: 'Shipped Orders',
              backgroundColor: '#ff9800'
            }
          ]
        };
      },
      error: (err: Error) => {
        console.error('Failed to fetch order summary data', err);
      }
    });
  }

  // Comman dialog function
  private openFilterDialog(
    currentYear: number | null,
    currentVendors: number[],
    onApply: (year: number | null, vendors: number[], count: number) => void,
    onClear: () => void,
    successMessage: string
  ): void {
    const dialogRef = this.dialog.open<
      FilterDialogComponent,
      FilterDialogData,
      FilterDialogResult
    >(FilterDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { year: currentYear, vendors: currentVendors }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.cleared) {
        onClear();
        return;
      }
      if (result) {
        onApply(result.year, result.vendors, result.count);
        this.notificationService.showSuccess(successMessage, 'close');
      }
    });
  }

  // Revenue Chart Filter Dialog
  public onRevenueFilterDialog(): void {
    this.openFilterDialog(
      this.selectedRevenueYear,
      this.selectedRevenueVendorIds,
      (year, vendors, count) => {
        this.selectedRevenueYear = year;
        this.selectedRevenueVendorIds = vendors;
        this.revenueFilterCount = count;
        this.fetchRevenueData(year ?? undefined, vendors);
      },
      () => {
        this.selectedRevenueYear = null;
        this.selectedRevenueVendorIds = [];
        this.revenueFilterCount = 0;
        this.fetchRevenueData(undefined, []);
        this.notificationService.showInfo('Revenue filter cleard', 'Close');
      },
      'Revenue data filter successfully '
    );
  }

  // Order Chart Filter Dialog
  public onOrderFilterDialog(): void {
    this.openFilterDialog(
      this.selectedOrderYear,
      this.selectedOrderVendorIds,
      (year, vendors, count) => {
        this.selectedOrderYear = year;
        this.selectedOrderVendorIds = vendors;
        this.orderFilterCount = count;
        this.fetchOrderSummaryData(year ?? undefined, vendors);
      },
      () => {
        this.selectedOrderYear = null;
        this.selectedOrderVendorIds = [];
        this.orderFilterCount = 0;
        this.fetchOrderSummaryData(undefined, []);
        this.notificationService.showInfo('Order filters cleared', 'Close');
      },
      'Order summary filtered successfully'
    );
  }
}
