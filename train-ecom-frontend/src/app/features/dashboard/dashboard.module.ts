import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { BaseChartDirective } from 'ng2-charts';
import { MetricsComponent } from './components/metrics/metrics.component';
import { ChartsComponent } from './components/charts/charts.component';
import { OrderChartComponent } from './components/order-chart/order-chart.component';
import { CategoryChartComponent } from './components/category-chart/category-chart.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';


@NgModule({
  declarations: [
    DashboardComponent,
    MetricsComponent,
    ChartsComponent,
    OrderChartComponent,
    CategoryChartComponent,
    RevenueChartComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    BaseChartDirective
  ]
})
export class DashboardModule { }
