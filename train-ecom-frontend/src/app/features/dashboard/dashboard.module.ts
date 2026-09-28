import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { BaseChartDirective } from 'ng2-charts';
import { MetricsComponent } from './components/metrics/metrics.component';


@NgModule({
  declarations: [
    DashboardComponent,
    MetricsComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    BaseChartDirective
  ]
})
export class DashboardModule { }
