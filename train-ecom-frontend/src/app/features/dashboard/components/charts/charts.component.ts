import { Component, Input, OnInit, SimpleChanges, inject } from '@angular/core';
import { ChartData, ChartType, Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
  getUserChartOptions
} from './charts.config';
import { Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  private router = inject(Router);
  private portalRoutes = inject(PortalRouteService);

  @Input() totalUsers: number = 0;
  @Input() totalCustomers: number = 0;
  @Input() totalVendors: number = 0;
  @Input() totalAdminUsers: number = 0;
  @Input() totalStaffUsers: number = 0;
  @Input() isVendor: boolean = false;
  @Input() isLoading: boolean = true;
  @Input() portal: PortalKey = 'admin';

  // user chart configuration
  public userChartsType: ChartType = 'pie';
  public userChartData!: ChartData<'pie'>;
  public userChartOptions = getUserChartOptions(
    this.router,
    this.portalRoutes,
  );

  ngOnChanges(changes: SimpleChanges): void {
    this.userChartOptions = getUserChartOptions(
      this.router,
      this.portalRoutes,
    );

    if (
      changes['totalCustomers'] ||
      changes['totalVendors'] ||
      changes['totalAdminUsers'] ||
      changes['totalStaffUsers'] ||
      changes['isVendor']
    ) {
      this.initUserChart();
    }
  }


  ngOnInit(): void {
    Chart.register(...registerables, ChartDataLabels);
  }

  // initialize user chart data based on the input values
  private initUserChart(): void {
    if (this.isVendor) {
      this.userChartData = {
        labels: ['Admin Users', 'Staff Users'],
        datasets: [
          {
            data: [
              this.totalAdminUsers,
              this.totalStaffUsers
            ],
            backgroundColor: [
              '#4caf50',
              '#2196f3'
            ]
          }
        ]
      };
      return;
    }
    this.userChartData = {
      labels: ['Customers', 'Vendors', 'Admin Users'],
      datasets: [
        {
          data: [this.totalCustomers, this.totalVendors, this.totalAdminUsers],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
        }
      ]
    };
  }

}
