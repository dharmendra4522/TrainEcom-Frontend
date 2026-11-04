import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { getOrderChartOptions } from '../charts/charts.config';
import { OrderSummaryResponse } from '../../../../core/models/dashboard.model';
import { FilterDialogComponent, FilterDialogData, FilterDialogResult } from '../../../../shared/components/filter-dialog/filter-dialog.component';

@Component({
  selector: 'app-order-chart',
  templateUrl: './order-chart.component.html',
  styleUrl: './order-chart.component.css'
})
export class OrderChartComponent {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private portalRoutes = inject(PortalRouteService);

  @Input() isLoading: boolean = true;
  @Input() portal: PortalKey = 'admin';
  @Input() isVendor: boolean = false;

  public totalOrders: number = 0;
  public orderFilterCount: number = 0;
  public selectedOrderYear: number | null = null;
  public selectedOrderVendorIds: number[] = [];
  public selectedOrderFromDate: Date | null = null;
  public selectedOrderToDate: Date | null = null;
  yearLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // order chart configuration
  public orderChartType: ChartType = 'bar';
  public orderChartData: ChartData<'bar'> = {
    labels: this.yearLabels,
    datasets: []
  };
  public get orderChartOptions(): ChartConfiguration['options'] {
    return getOrderChartOptions(
      this.router,
      this.portalRoutes,
      this.portal,
      this.selectedOrderYear
    );
  }

  ngOnInit(): void {
    this.fetchOrderSummaryData();
  }

  // fetch order summary data for charts
  private fetchOrderSummaryData(year?: number, vendorIds?: number[], fromDate?: Date | null, toDate?: Date | null): void {
    this.dashboardService.fetchOrderSummary(year, vendorIds, fromDate, toDate).subscribe({
      next: (data: OrderSummaryResponse) => {
        this.totalOrders = data.totalOrders;
        const labels = this.yearLabels;

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

  // 

  // Order Chart Filter Dialog
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
        fromDate: this.selectedOrderFromDate,
        toDate: this.selectedOrderToDate,
        isVendor: this.isVendor
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.cleared) {
        this.selectedOrderYear = null;
        this.selectedOrderVendorIds = [];
        this.selectedOrderFromDate = null;
        this.selectedOrderToDate = null;
        this.orderFilterCount = 0;
        this.fetchOrderSummaryData(undefined, [], null, null);
        this.notificationService.showInfo('Order filters cleared', 'Close');
        return;
      }
      if (result) {
        this.selectedOrderYear = result.year;
        this.selectedOrderVendorIds = result.vendors;
        this.selectedOrderFromDate = result.fromDate ?? null;
        this.selectedOrderToDate = result.toDate ?? null;
        this.orderFilterCount = result.count;
        this.fetchOrderSummaryData(result.year ?? undefined, result.vendors, result.fromDate ?? null, result.toDate ?? null);
        this.notificationService.showSuccess('Order summary filtered successfully', 'close');
      }
    });
  }

}
