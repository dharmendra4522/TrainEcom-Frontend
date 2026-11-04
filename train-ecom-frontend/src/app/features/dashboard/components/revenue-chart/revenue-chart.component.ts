import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { ChartData, ChartType } from 'chart.js';
import {
  revenueChartOptions as revenueChartConfiguration
} from '../charts/charts.config';
import { RevenueData } from '../../../../core/models/dashboard.model';
import { FilterDialogComponent, FilterDialogData, FilterDialogResult } from '../../../../shared/components/filter-dialog/filter-dialog.component';
@Component({
  selector: 'app-revenue-chart',
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.css'
})
export class RevenueChartComponent {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private dashboardService = inject(DashboardService);

  @Input() isLoading: boolean = true;
  @Input() portal: PortalKey = 'admin';
  @Input() isVendor: boolean = false;

  // Revenue Filter States
  public revenueFilterCount: number = 0;
  public selectedRevenueYear: number | null = null;
  public selectedRevenueVendorIds: number[] = [];
  public selectedRevenueFromDate: Date | null = null;
  public selectedRevenueToDate: Date | null = null;
  public totalRevenue: number = 0;
  private yearLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  public revenueChartType: ChartType = 'bar';
  public revenueChartData: ChartData<'bar'> = {
    labels: this.yearLabels,
    datasets: [{ data: [], backgroundColor: '#4caf50' }]
  };
  public revenueChartOptions = revenueChartConfiguration;

  ngOnInit(): void {
    this.fetchRevenueData();
  }

  // fetch revenue data for charts
  private fetchRevenueData(year?: number, vendorIds?: number[], fromDate?: Date | null, toDate?: Date | null): void {
    this.dashboardService.fetchRevenueData(year, vendorIds, fromDate, toDate).subscribe({
      next: (data: RevenueData) => {
        this.totalRevenue = data.totalRevenue;
        const labels = this.yearLabels;
        const revenues = labels.map(
          (_, monthIndex) =>
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

  // handle filter dialog 
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
        vendors: this.selectedRevenueVendorIds,
        fromDate: this.selectedRevenueFromDate,
        toDate: this.selectedRevenueToDate,
        isVendor: this.isVendor
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.cleared) {
        this.selectedRevenueYear = null;
        this.selectedRevenueVendorIds = [];
        this.selectedRevenueFromDate = null;
        this.selectedRevenueToDate = null;
        this.revenueFilterCount = 0;
        this.fetchRevenueData(undefined, [], null, null);
        this.notificationService.showInfo('Revenue filter cleared', 'Close');
        return;
      }
      if (result) {
        this.selectedRevenueYear = result.year;
        this.selectedRevenueVendorIds = result.vendors;
        this.selectedRevenueFromDate = result.fromDate ?? null;
        this.selectedRevenueToDate = result.toDate ?? null;
        this.revenueFilterCount = result.count;
        this.fetchRevenueData(result.year ?? undefined, result.vendors, result.fromDate ?? null, result.toDate ?? null);
        this.notificationService.showSuccess('Revenue data filtered successfully', 'close');
      }
    });
  }

}
