import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { ChartData, ChartType } from 'chart.js';
import { getProductChartOptions } from '../charts/charts.config';
import { CategoryProductSummaryResponse } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-category-chart',
  templateUrl: './category-chart.component.html',
  styleUrl: './category-chart.component.css'
})
export class CategoryChartComponent {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private portalRoutes = inject(PortalRouteService);

  @Input() isLoading: boolean = true;
  @Input() portal: PortalKey = 'admin';
  @Input() isVendor: boolean = false;
  public totalCategories: number = 0;

  public productChartType: ChartType = 'bar';
  public productChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: '#2196f3' }]
  };
  public productChartOptions = getProductChartOptions(
    this.router,
    this.portalRoutes
  );

  ngOnInit(): void {
    this.fetchCategoryData();
  }

  // fetch category data for charts
  private fetchCategoryData(): void {
    this.dashboardService.fetchCategoryWiseProductCount().subscribe({
      next: (data: CategoryProductSummaryResponse) => {
        this.totalCategories = data.totalCategories;
        const labels = data.summary.map(
          category => category.categoryName
        );
        const datasets: {
          label: string;
          data: number[];
          backgroundColor: string;
          maxBarThickness: number;
        }[] = [];
        const subCategoryMap = new Map<
          string,
          number[]
        >();
        data.summary.forEach(
          (category, categoryIndex) => {
            category.subCategories.forEach(
              subCategory => {
                if (
                  !subCategoryMap.has(
                    subCategory.subCategoryName
                  )
                ) {
                  subCategoryMap.set(
                    subCategory.subCategoryName,
                    new Array(labels.length).fill(0)
                  );
                }
                subCategoryMap.get(
                  subCategory.subCategoryName
                )![categoryIndex] =
                  subCategory.productCount;
              }
            );
          }
        );
        const colors = [
          '#4caf50',
          '#ff9800',
          '#e91e63',
          '#9c27b0',
          '#009688',
          '#ff5722',
          '#3f51b5'
        ];
        Array.from(subCategoryMap.entries())
          .forEach(
            ([subCategoryName, values], index) => {
              datasets.push({
                label: subCategoryName,
                data: values,
                backgroundColor: colors[index % colors.length],
                maxBarThickness: 40
              });
            }
          );

        this.productChartData = {
          labels,
          datasets
        };
      },
      error: (err: Error) => {
        console.error('Failed to fetch category data',err);
      }
    });
  }


}
