import {
  CategoryWiseProductCount,
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
import { DashboardData } from '../../../../core/models/dashboard.model';
import {
  categoryProductData,
  orderStatusChartData,
  revenueChartData,
} from '../dashboard/dashboard.utils';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from '../../../../shared/components/filter-dialog/filter-dialog.component';
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
  @Input() isLoading: boolean = true;

  public totalRevenue: number = 0;
  public revenueFilterCount: number = 0;

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
              right: 70,
            }
          : {
              top: 20,
              bottom: 10,
              left: 10,
              right: 10,
            },
    },
    plugins: {
      legend: {
        position: 'bottom',
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
        padding: 4,
      },
    },
  };

  // product chart configuration
  public productChartType: ChartType = 'bar';
  public productChartData: ChartData<'bar'> = categoryProductData;
  public productChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
      },
      y: { beginAtZero: true },
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
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
      },
      y: { beginAtZero: true },
    },
  };

  // order chart configuration
  public orderChartType: ChartType = 'bar';
  public orderChartData: ChartData<'bar'> = orderStatusChartData;
  public orderChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  ngOnInit(): void {
    Chart.register(...registerables, ChartDataLabels);
    this.initUserChart();
  }

  public ngOnChanges(): void {
    this.initUserChart();
    this.fetchCategoryData();
    this.fetchRevenueData();
  }

  // initialize user chart data based on the input values
  private initUserChart(): void {
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
    this.dashboardService.fetchCategoryWiseProductCount().subscribe({
      next: (data: CategoryWiseProductCount[]) => {
        const labels = data.map((item) => item.categoryName);
        const counts = data.map((item) => item.productCount);
        this.productChartData = {
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
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
  private fetchRevenueData(year?: number): void {
    this.dashboardService.fetchRevenueData(year).subscribe({
      next: (data: RevenueData) => {
        this.totalRevenue = data.totalRevenue;
        const labels = data.monthlyRevenue.map((item) => item.monthName);
        const revenues = data.monthlyRevenue.map((item) => item.revenue);

        this.revenueChartData = {
          labels: labels,
          datasets: [
            {
              data: revenues,
              backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
            },
          ],
        };
      },
      error: (err: Error) => {
        console.error('Failed to fetch revenue data', err);
      },
    });
  }

  // filter dialog for charts
  public onFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '400px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.year) {
        this.fetchRevenueData(result.year);
        this.revenueFilterCount = result.count;
        this.notificationService.showSuccess(
          `Revenue data filtered for year ${result.year}`,
          'Close',
        );
      } else {
        this.notificationService.showInfo(
          'Revenue data filter cancelled',
          'Close',
        );
      }
    });
  }
}
