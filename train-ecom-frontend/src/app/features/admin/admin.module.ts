import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductsComponent } from './products/products.component';
import { BrandComponent } from './brand/brand.component';
@NgModule({
  declarations: [
    DashboardComponent,
    ProductsComponent,
    BrandComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule
    
  ]
})
export class AdminModule { }
