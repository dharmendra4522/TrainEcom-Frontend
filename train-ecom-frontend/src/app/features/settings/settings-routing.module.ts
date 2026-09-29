import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { BannerManagementComponent } from './components/banner-management/banner-management.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'banner-management' },
  {
    path: 'banner-management',
    canActivate: [adminGuard],
    component: BannerManagementComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
