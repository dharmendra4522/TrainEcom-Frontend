import {
  CategoryWiseProductCount,
  OrderSummaryResponse,
  RevenueData,
} from './../../../../core/models/dashboard.model';
import { Component, Input, OnInit, inject } from '@angular/core';
import {
  ChartConfiguration,
  ChartData,
  ChartType,
  Chart,
  registerables,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../../../../core/services/dashboard.service';
import {
  categoryProductData,
  orderStatusChartData,
  revenueChartData,
  userChartData,
} from '../dashboard/dashboard.utils';
import { MatDialog } from '@angular/material/dialog';
import {
  FilterDialogComponent,
  FilterDialogData,
  FilterDialogResult,
} from '../../../../shared/components/filter-dialog/filter-dialog.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private dashboardService = inject(DashboardService);

  @Input() totalUsers: number = 0;
  @Input() totalCustomers: number = 0;
  @Input() totalVendors: number = 0;
  @Input() totalAdminUsers: number = 0;
  @Input() isVendor: boolean = false;
  @Input() isLoading: boolean = true;

  // State variables update karein
  public totalRevenue: number = 0;
  public totalOrders: number = 0;

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
  // product chart configuration
  public userChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding:
        window.innerWidth < 768
          ? {
            top: 10,
            bottom: 20,
            left: 60,
            right: 70
          }
          : {
            top: 20,
            bottom: 10,
            left: 10,
            right: 10
          }
    },
    plugins: {
      legend: {
        position: 'bottom'
      },
      datalabels: {
        color: '#000',
        formatter: (value, context) => {
          const label = context.chart.data.labels?.[context.dataIndex];
          return `${label}: ${value}`;
        },
        anchor: 'end',
        align: 'end',
        offset: 4,
        display: true,
        borderRadius: 4,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderWidth: 1,
        padding: 4
      }
    }
  };

  // product chart configuration
  public productChartType: ChartType = 'bar';
  public productChartData: ChartData<'bar'> = categoryProductData;
  public productChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
      },
      y: { beginAtZero: true }
    },
  };

  // revenue chart configuration
  public revenueChartType: ChartType = 'bar';
  public revenueChartData: ChartData<'bar'> = revenueChartData;
  public revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
      },
      y: { beginAtZero: true }
    },
  };

  // order chart configuration
  public orderChartType: ChartType = 'bar';
  public orderChartData: ChartData<'bar'> = orderStatusChartData;
  public orderChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    },
  };

  ngOnInit(): void {
    Chart.register(...registerables, ChartDataLabels);
    this.initUserChart();
    this.fetchCategoryData();
    this.fetchRevenueData();
    this.fetchorderSummaryData();
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
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
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
        const labels = data.map((item) => item.categoryName);
        const counts = data.map((item) => item.productCount);
        this.productChartData = {
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: ['#2196f3']
            }
          ]
        };
      },
      error: (err: Error) => {
        console.error('Failed to fetch category data', err);
      }
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
        const revenues = labels.map((_, monthIndex) =>
          data.monthlyRevenue.find((item) => item.month === monthIndex + 1)
            ?.revenue ?? 0
        );

        this.revenueChartData = {
          labels: labels,
          datasets: [
            {
              data: revenues,
              backgroundColor: ['#4caf50']
            }
          ]
        };
      },
      error: (err: Error) => {
        console.error('Failed to fetch revenue data', err);
      }
    });
  }

  // fetch order summary data for charts
  private fetchorderSummaryData(year?: number, vendorIds?: number[]): void {
    if (this.isVendor) {
      return;
    }
    this.dashboardService.fetchOrderSummary(year, vendorIds).subscribe({
      next: (data: OrderSummaryResponse) => {
        this.totalOrders = data.totalOrders;
        const labels = [...orderStatusChartData.labels];

        // map the order summary data to the chart data
        const activeOrders = labels.map((_, monthIndex) =>
          data.monthlyData.find((item) => item.month === monthIndex + 1)
            ?.activeOrders ?? 0,
        );
        const deliveredOrders = labels.map((_, monthIndex) =>
          data.monthlyData.find((item) => item.month === monthIndex + 1)
            ?.deliveredOrders ?? 0,
        );
        const cancelOrders = labels.map((_, monthIndex) =>
          data.monthlyData.find((item) => item.month === monthIndex + 1)
            ?.cancelOrders ?? 0
        );
        const shippedOrders = labels.map((_, monthIndex) =>
          data.monthlyData.find((item) => item.month === monthIndex + 1)
            ?.shippedOrders ?? 0
        );

        this.orderChartData = {
          labels: labels,
          datasets: [
            { data: activeOrders, label: 'Active Orders', backgroundColor: '#4caf50' },
            { data: deliveredOrders, label: 'Delivered Orders', backgroundColor: '#2196f3' },
            { data: cancelOrders, label: 'Cancelled Orders', backgroundColor: '#f44336' },
            { data: shippedOrders, label: 'Shipped Orders', backgroundColor: '#ff9800' }
          ]
        }
      },
      error: (err: Error) => {
        console.error('Failed to fetch order summary data', err);
      },
    })
  }

  // Revenue Chart Filter Dialog
  public onRevenueFilterDialog(): void {
    const dialogRef = this.dialog.open<
      FilterDialogComponent,
      FilterDialogData,
      FilterDialogResult
    >(FilterDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        year: this.selectedRevenueYear,
        vendors: this.selectedRevenueVendorIds
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.cleared) {
        this.selectedRevenueYear = null;
        this.selectedRevenueVendorIds = [];
        this.revenueFilterCount = 0;
        this.fetchRevenueData(undefined, this.selectedRevenueVendorIds);
        this.notificationService.showInfo('Revenue filters cleared', 'Close');
        return;
      }

      if (result) {
        this.selectedRevenueYear = result.year;
        this.selectedRevenueVendorIds = result.vendors;
        this.revenueFilterCount = result.count;

        this.fetchRevenueData(result.year ?? undefined, this.selectedRevenueVendorIds);
        this.notificationService.showSuccess('Revenue data filtered successfully', 'Close');
      }
    });
  }

  //  Order Chart Filter Dialog
  public onOrderFilterDialog(): void {
    const dialogRef = this.dialog.open<
      FilterDialogComponent,
      FilterDialogData,
      FilterDialogResult
    >(FilterDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        year: this.selectedOrderYear,
        vendors: this.selectedOrderVendorIds,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.cleared) {
        this.selectedOrderYear = null;
        this.selectedOrderVendorIds = [];
        this.orderFilterCount = 0;
        this.fetchorderSummaryData(undefined, this.selectedOrderVendorIds);
        this.notificationService.showInfo('Order filters cleared', 'Close');
        return;
      }

      if (result) {
        this.selectedOrderYear = result.year;
        this.selectedOrderVendorIds = result.vendors;
        this.orderFilterCount = result.count;

        this.fetchorderSummaryData(result.year ?? undefined, this.selectedOrderVendorIds);
        this.notificationService.showSuccess('Order summary filtered successfully', 'Close')
      }
    });
  }

}
