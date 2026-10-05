import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { BannerManagementComponent } from './components/banner-management/banner-management.component';
import { SharedModule } from '../../shared/shared.module';
import { AddUpdateBannerComponent } from './components/add-update-banner/add-update-banner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    BannerManagementComponent,
    AddUpdateBannerComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
]
})
export class SettingsModule { }
