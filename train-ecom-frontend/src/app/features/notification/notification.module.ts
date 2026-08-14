import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationHistoryComponent } from './components/notification-history/notification-history.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    NotificationHistoryComponent
  ],
  imports: [
    CommonModule,
    NotificationRoutingModule,
    SharedModule
  ]
})
export class NotificationModule { }
